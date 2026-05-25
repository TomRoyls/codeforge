// ─── Interfaces ──────────────────────────────────────────

export interface ShiftingMeasure {
  color: number
  spectrum:
    | 'full-rainbow'
    | 'vivid-play'
    | 'proper-color'
    | 'faint-shimmer'
    | 'no-color'
    | 'no-play'
  hasHighColor: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasFlexible: boolean
  hasNoRigid: boolean
  hasVaried: boolean
  hasNoMonotone: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasExpressive: boolean
  hasNoFormulaic: boolean
  hasDynamic: boolean
  hasNoFixed: boolean
  hasMultiConcern: boolean
  hasNoSinglePurpose: boolean
  hasKaleidoscopic: boolean
  rigidCount: number
  monotoneCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  dawn:
    | 'brilliant-dawn'
    | 'clear-morning'
    | 'proper-twilight'
    | 'foggy-horizon'
    | 'dark-night'
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
  hasNoArcane: boolean
  hasVisible: boolean
  hasNoInvisible: boolean
  hasDocumented: boolean
  hasIlluminated: boolean
  hasDirect: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface BlazingMeasure {
  warmth: number
  fire:
    | 'inferno-of-passion'
    | 'warm-blaze'
    | 'proper-glow'
    | 'lukewarm'
    | 'cold-ember'
    | 'no-warmth'
  hasHighWarmth: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasActive: boolean
  hasNoDead: boolean
  hasContributing: boolean
  hasNoParasitic: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasConnected: boolean
  hasNoOrphaned: boolean
  hasAlive: boolean
  hasNoZombie: boolean
  hasThriving: boolean
  hasVital: boolean
  hasPassionate: boolean
  isolatedCount: number
  deadCount: number
}

export interface SpanningMeasure {
  richness: number
  spectrum:
    | 'full-spectrum'
    | 'rich-palette'
    | 'proper-range'
    | 'limited-palette'
    | 'monochrome'
    | 'no-spectrum'
  hasHighRichness: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasComplete: boolean
  hasNoIncomplete: boolean
  hasThorough: boolean
  hasNoSuperficial: boolean
  hasComprehensive: boolean
  hasRobust: boolean
  hasDiverse: boolean
  untestedCount: number
  unsafeCount: number
}

export interface GlowingMeasure {
  quality: number
  opal:
    | 'ethereal-glow'
    | 'warm-diffusion'
    | 'proper-sheen'
    | 'dull-surface'
    | 'no-glow'
    | 'no-opalescence'
  hasHighQuality: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasElegant: boolean
  hasNoClunky: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasPolished: boolean
  hasNoRough: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasRefined: boolean
  hasMature: boolean
  hasProven: boolean
  hasDeep: boolean
  chaoticCount: number
  adHocCount: number
}

export type FireCondition =
  | 'opal-masterpiece'
  | 'fire-horizon'
  | 'proper-gem'
  | 'dull-stone'
  | 'common-rock'
  | 'void'

export interface OpalFire {
  file: string
  playOfColor: number
  dawnClarity: number
  fireWarmth: number
  spectrumRichness: number
  opalescenceQuality: number
  shifting: ShiftingMeasure
  illuminating: IlluminatingMeasure
  blazing: BlazingMeasure
  spanning: SpanningMeasure
  glowing: GlowingMeasure
  condition: FireCondition
  qualityScore: number
}

export type DepositType =
  | 'lightning-ridge'
  | 'coober-pedy'
  | 'proper-mine'
  | 'small-pocket'
  | 'barren-ground'
  | 'no-deposit'

export type DepositCondition =
  | 'opal-paradise'
  | 'fire-desert'
  | 'proper-field'
  | 'dull-ground'
  | 'barren-earth'
  | 'void'

export interface OpalDeposit {
  directory: string
  fires: OpalFire[]
  avgClarity: number
  avgRichness: number
  avgQuality: number
  opalMasterpieceCount: number
  voidCount: number
  depositType: DepositType
  condition: DepositCondition
}

export type GemologistGrade =
  | 'opal-visionary'
  | 'fire-reader'
  | 'gem-cutter'
  | 'apprentice'
  | 'novice'
  | 'rock-collector'

export interface OpalHorizonStats {
  totalFiles: number
  totalDeposits: number
  avgPlayOfColor: number
  avgDawnClarity: number
  avgFireWarmth: number
  avgSpectrumRichness: number
  avgOpalescenceQuality: number
  opalMasterpieceCount: number
  fireHorizonCount: number
  properGemCount: number
  dullStoneCount: number
  commonRockCount: number
  voidCount: number
  hasHighColorCount: number
  hasHighClarityCount: number
  hasHighWarmthCount: number
  hasHighRichnessCount: number
  hasHighQualityCount: number
  overallBrilliance: number
  gemologistGrade: GemologistGrade
  bestFire: string
  mostColorful: string
  clearest: string
  warmest: string
  mostDiverse: string
  mostGlowing: string
}

export interface OpalHorizonResult {
  fires: OpalFire[]
  deposits: OpalDeposit[]
  sky: {
    avgClarity: number
    avgRichness: number
    avgQuality: number
    isOpal: boolean
    overallBrilliance: number
  }
  stats: OpalHorizonStats
  celebration: {
    milestone: number
    name: string
    message: string
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

// ─── Measure functions ──────────────────────────────────

/** @example measureShifting('export class Analyzer<T> { }') */
export function measureShifting(content: string): ShiftingMeasure {
  const hasModular = /\b(import|export)\b/.test(content)
  const rigidCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoMonolithic = rigidCount === 0
  const hasFlexible = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoRigid = !/\b(any\b.*any\b)/.test(content)
  const hasVaried = /\b(class|interface|type|enum|function)\b/.test(content)
  const monotoneCount = (content.match(/\b(var|let)\b/g) ?? []).length
  const hasNoMonotone = !(/\blet\b/.test(content) && !/\bconst\b/.test(content))
  const hasAdaptive = /\b(async|await|Promise)\b/.test(content)
  const hasNoStatic = !/\b(eval)\b/.test(content)
  const hasExpressive = /\b(const|readonly)\b/.test(content)
  const hasNoFormulaic = !/\b(copy|paste|duplicate)\b/i.test(content)
  const hasDynamic = /\b(function|=>|async)\b/.test(content)
  const hasNoFixed = rigidCount === 0
  const hasMultiConcern = /\b(class|interface|type)\b/.test(content)
  const hasNoSinglePurpose = !/\b(single|only|just)\b/i.test(content)
  const hasKaleidoscopic = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasModular,
    hasFlexible,
    hasVaried,
    hasAdaptive,
    hasExpressive,
    hasDynamic,
    hasMultiConcern,
    hasKaleidoscopic,
  ]

  const color = computeScore(positiveBooleans)
  const hasHighColor = color >= 60
  const spectrum = classifySpectrum(color)

  return {
    color,
    spectrum,
    hasHighColor,
    hasModular,
    hasNoMonolithic,
    hasFlexible,
    hasNoRigid,
    hasVaried,
    hasNoMonotone,
    hasAdaptive,
    hasNoStatic,
    hasExpressive,
    hasNoFormulaic,
    hasDynamic,
    hasNoFixed,
    hasMultiConcern,
    hasNoSinglePurpose,
    hasKaleidoscopic,
    rigidCount,
    monotoneCount,
  }
}

/** @example measureIlluminating('export function analyze(): void {}') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(async|await|readonly|private)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(import|export|from)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasUnderstandable = /\b(if|return|throw)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasVisible = /\b(export|public)\b/.test(content)
  const hasNoInvisible = !/\b(hidden|invisible|secret)\b/i.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIlluminated = /\b(readonly|type|interface)\b/.test(content)
  const hasDirect = /\b(return|yield|emit)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasVisible,
    hasDocumented,
    hasIlluminated,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60
  const dawn = classifyDawn(clarity)

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
    hasNoArcane,
    hasVisible,
    hasNoInvisible,
    hasDocumented,
    hasIlluminated,
    hasDirect,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureBlazing('export async function analyze(): Promise<Result> { }') */
export function measureBlazing(content: string): BlazingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|standalone|unused)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasActive = /\b(function|class|=|=>)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|deprecated)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasContributing = /\b(return|export|yield)\b/.test(content)
  const hasNoParasitic = !/\b(parasitic|leech|drain)\b/i.test(content)
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|frozen|static)\b/i.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const hasNoOrphaned = !/\b(orphaned|abandoned|alone)\b/i.test(content)
  const hasAlive = /\b(try|catch|if|throw)\b/.test(content)
  const hasNoZombie = !/\b(zombie|undead|lurking)\b/i.test(content)
  const hasThriving = /\b(class|interface|type)\b/.test(content)
  const hasVital = /\b(readonly|const|as const)\b/.test(content)
  const hasPassionate = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasExported,
    hasActive,
    hasContributing,
    hasEvolving,
    hasConnected,
    hasAlive,
    hasThriving,
    hasVital,
  ]

  const warmth = computeScore(positiveBooleans)
  const hasHighWarmth = warmth >= 60
  const fire = classifyFire(warmth)

  return {
    warmth,
    fire,
    hasHighWarmth,
    hasExported,
    hasNoIsolated,
    hasActive,
    hasNoDead,
    hasContributing,
    hasNoParasitic,
    hasEvolving,
    hasNoStagnant,
    hasConnected,
    hasNoOrphaned,
    hasAlive,
    hasNoZombie,
    hasThriving,
    hasVital,
    hasPassionate,
    isolatedCount,
    deadCount,
  }
}

/** @example measureSpanning('try { analyze() } catch { handleError() }') */
export function measureSpanning(content: string): SpanningMeasure {
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const hasNoBareCrash = !/\beval\s*\(/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoUndocumented = !/\b(undocumented|undocumented)\b/i.test(content)
  const hasComplete = /\b(class|interface|type)\b/.test(content)
  const hasNoIncomplete = !/\b(incomplete|partial|wip)\b/i.test(content)
  const hasThorough = /\b(readonly|private|protected)\b/.test(content)
  const hasNoSuperficial = !/\b(superficial|shallow|skinny)\b/i.test(content)
  const hasComprehensive = /\b(import|export|from)\b/.test(content)
  const hasRobust = /\b(try|catch|Error|throw)\b/.test(content)
  const hasDiverse = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasTypeSafe,
    hasErrorHandled,
    hasDocumented,
    hasComplete,
    hasThorough,
    hasComprehensive,
    hasDiverse,
  ]

  const richness = computeScore(positiveBooleans)
  const hasHighRichness = richness >= 60
  const spectrum = classifyRichnessSpectrum(richness)

  return {
    richness,
    spectrum,
    hasHighRichness,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasErrorHandled,
    hasNoBareCrash,
    hasDocumented,
    hasNoUndocumented,
    hasComplete,
    hasNoIncomplete,
    hasThorough,
    hasNoSuperficial,
    hasComprehensive,
    hasRobust,
    hasDiverse,
    untestedCount,
    unsafeCount,
  }
}

/** @example measureGlowing('export class Analyzer { readonly config: Config }') */
export function measureGlowing(content: string): GlowingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasNoClunky = !/\b(clunky|ugly|messy)\b/i.test(content)
  const hasClean = (content.match(/\bany\b/g) ?? []).length === 0
  const hasNoDirty = !content.includes('@ts-ignore')
  const hasPolished = /\b(const|readonly|as const)\b/.test(content)
  const hasNoRough = !/\b(hack|workaround|monkey)\b/i.test(content)
  const hasPrincipled = /\b(import|export|from)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasOrganized = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoScattered = !/\b(scattered|disorganized|chaotic)\b/i.test(content)
  const hasRefined = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMature = /\b(readonly|as const)\b/.test(content)
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDeep = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasElegant,
    hasClean,
    hasPolished,
    hasPrincipled,
    hasOrganized,
    hasRefined,
    hasDeep,
  ]

  const quality = computeScore(positiveBooleans)
  const hasHighQuality = quality >= 60
  const opal = classifyOpal(quality)

  return {
    quality,
    opal,
    hasHighQuality,
    hasWellStructured,
    hasNoChaotic,
    hasElegant,
    hasNoClunky,
    hasClean,
    hasNoDirty,
    hasPolished,
    hasNoRough,
    hasPrincipled,
    hasNoAdHoc,
    hasOrganized,
    hasNoScattered,
    hasRefined,
    hasMature,
    hasProven,
    hasDeep,
    chaoticCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifySpectrum(score: number): ShiftingMeasure['spectrum'] {
  if (score >= 90) return 'full-rainbow'
  if (score >= 75) return 'vivid-play'
  if (score >= 60) return 'proper-color'
  if (score >= 40) return 'faint-shimmer'
  if (score >= 20) return 'no-color'
  return 'no-play'
}

function classifyDawn(score: number): IlluminatingMeasure['dawn'] {
  if (score >= 90) return 'brilliant-dawn'
  if (score >= 75) return 'clear-morning'
  if (score >= 60) return 'proper-twilight'
  if (score >= 40) return 'foggy-horizon'
  if (score >= 20) return 'dark-night'
  return 'no-clarity'
}

function classifyFire(score: number): BlazingMeasure['fire'] {
  if (score >= 90) return 'inferno-of-passion'
  if (score >= 75) return 'warm-blaze'
  if (score >= 60) return 'proper-glow'
  if (score >= 40) return 'lukewarm'
  if (score >= 20) return 'cold-ember'
  return 'no-warmth'
}

function classifyRichnessSpectrum(score: number): SpanningMeasure['spectrum'] {
  if (score >= 90) return 'full-spectrum'
  if (score >= 75) return 'rich-palette'
  if (score >= 60) return 'proper-range'
  if (score >= 40) return 'limited-palette'
  if (score >= 20) return 'monochrome'
  return 'no-spectrum'
}

function classifyOpal(score: number): GlowingMeasure['opal'] {
  if (score >= 90) return 'ethereal-glow'
  if (score >= 75) return 'warm-diffusion'
  if (score >= 60) return 'proper-sheen'
  if (score >= 40) return 'dull-surface'
  if (score >= 20) return 'no-glow'
  return 'no-opalescence'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): FireCondition {
  if (score >= 90) return 'opal-masterpiece'
  if (score >= 75) return 'fire-horizon'
  if (score >= 60) return 'proper-gem'
  if (score >= 40) return 'dull-stone'
  if (score >= 20) return 'common-rock'
  return 'void'
}

/** @example classifyDepositType(fires) */
export function classifyDepositType(fires: OpalFire[]): DepositType {
  if (fires.length === 0) return 'no-deposit'
  const avg = fires.reduce((s, f) => s + f.qualityScore, 0) / fires.length
  if (avg >= 90) return 'lightning-ridge'
  if (avg >= 75) return 'coober-pedy'
  if (avg >= 60) return 'proper-mine'
  if (avg >= 40) return 'small-pocket'
  if (avg >= 20) return 'barren-ground'
  return 'no-deposit'
}

/** @example classifyDepositCondition(avgQuality) */
export function classifyDepositCondition(avgQuality: number): DepositCondition {
  if (avgQuality >= 85) return 'opal-paradise'
  if (avgQuality >= 70) return 'fire-desert'
  if (avgQuality >= 55) return 'proper-field'
  if (avgQuality >= 35) return 'dull-ground'
  if (avgQuality >= 15) return 'barren-earth'
  return 'void'
}

/** @example classifyGemologistGrade(80) */
export function classifyGemologistGrade(avgBrilliance: number): GemologistGrade {
  if (avgBrilliance >= 80) return 'opal-visionary'
  if (avgBrilliance >= 65) return 'fire-reader'
  if (avgBrilliance >= 50) return 'gem-cutter'
  if (avgBrilliance >= 35) return 'apprentice'
  if (avgBrilliance >= 20) return 'novice'
  return 'rock-collector'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeOpalFire(content, 'app.ts') */
export function analyzeOpalFire(content: string, filePath: string): OpalFire {
  const shifting = measureShifting(content)
  const illuminating = measureIlluminating(content)
  const blazing = measureBlazing(content)
  const spanning = measureSpanning(content)
  const glowing = measureGlowing(content)

  const playOfColor = shifting.color
  const dawnClarity = illuminating.clarity
  const fireWarmth = blazing.warmth
  const spectrumRichness = spanning.richness
  const opalescenceQuality = glowing.quality

  const qualityScore = Math.round(
    playOfColor * 0.2 +
    dawnClarity * 0.2 +
    fireWarmth * 0.2 +
    spectrumRichness * 0.2 +
    opalescenceQuality * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    playOfColor,
    dawnClarity,
    fireWarmth,
    spectrumRichness,
    opalescenceQuality,
    shifting,
    illuminating,
    blazing,
    spanning,
    glowing,
    condition,
    qualityScore,
  }
}

/** @example analyzeOpalDeposit(fires, 'src') */
export function analyzeOpalDeposit(fires: OpalFire[], dirPath: string): OpalDeposit {
  if (fires.length === 0) {
    return {
      directory: dirPath,
      fires: [],
      avgClarity: 0,
      avgRichness: 0,
      avgQuality: 0,
      opalMasterpieceCount: 0,
      voidCount: 0,
      depositType: 'no-deposit',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    fires.reduce((s, f) => s + f.dawnClarity, 0) / fires.length,
  )
  const avgRichness = Math.round(
    fires.reduce((s, f) => s + f.spectrumRichness, 0) / fires.length,
  )
  const avgQuality = Math.round(
    fires.reduce((s, f) => s + f.qualityScore, 0) / fires.length,
  )

  const opalMasterpieceCount = fires.filter(
    (f) => f.condition === 'opal-masterpiece',
  ).length
  const voidCount = fires.filter((f) => f.condition === 'void').length

  const depositType = classifyDepositType(fires)
  const condition = classifyDepositCondition(avgQuality)

  return {
    directory: dirPath,
    fires,
    avgClarity,
    avgRichness,
    avgQuality,
    opalMasterpieceCount,
    voidCount,
    depositType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOpalHorizonResult(['a.ts'], [content]) */
export async function buildOpalHorizonResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OpalHorizonResult> {
  const fires: OpalFire[] = files.map((file, i) =>
    analyzeOpalFire(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OpalFire[]>()
  for (const fire of fires) {
    const dir = fire.file.includes('/')
      ? fire.file.substring(0, fire.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(fire)
    } else {
      dirMap.set(dir, [fire])
    }
  }

  const deposits: OpalDeposit[] = Array.from(dirMap.entries()).map(([dir, dirFires]) =>
    analyzeOpalDeposit(dirFires, dir),
  )

  const avgClarity =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.dawnClarity, 0) / fires.length)
      : 0
  const avgRichness =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.spectrumRichness, 0) / fires.length)
      : 0
  const avgQuality =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.qualityScore, 0) / fires.length)
      : 0
  const overallBrilliance = avgQuality
  const isOpal = overallBrilliance >= 60

  const sky = { avgClarity, avgRichness, avgQuality, isOpal, overallBrilliance }

  const avgPlayOfColor =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.playOfColor, 0) / fires.length)
      : 0
  const avgDawnClarity = avgClarity
  const avgFireWarmth =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.fireWarmth, 0) / fires.length)
      : 0
  const avgSpectrumRichness = avgRichness
  const avgOpalescenceQuality =
    fires.length > 0
      ? Math.round(fires.reduce((s, f) => s + f.opalescenceQuality, 0) / fires.length)
      : 0

  const opalMasterpieceCount = fires.filter(
    (f) => f.condition === 'opal-masterpiece',
  ).length
  const fireHorizonCount = fires.filter((f) => f.condition === 'fire-horizon').length
  const properGemCount = fires.filter((f) => f.condition === 'proper-gem').length
  const dullStoneCount = fires.filter((f) => f.condition === 'dull-stone').length
  const commonRockCount = fires.filter((f) => f.condition === 'common-rock').length
  const voidCount = fires.filter((f) => f.condition === 'void').length

  const hasHighColorCount = fires.filter((f) => f.shifting.hasHighColor).length
  const hasHighClarityCount = fires.filter((f) => f.illuminating.hasHighClarity).length
  const hasHighWarmthCount = fires.filter((f) => f.blazing.hasHighWarmth).length
  const hasHighRichnessCount = fires.filter((f) => f.spanning.hasHighRichness).length
  const hasHighQualityCount = fires.filter((f) => f.glowing.hasHighQuality).length

  const gemologistGrade = classifyGemologistGrade(overallBrilliance)

  const bestFire = fires.length > 0
    ? fires.reduce((best, f) => (f.qualityScore > best.qualityScore ? f : best)).file
    : ''
  const mostColorful = fires.length > 0
    ? fires.reduce((best, f) => (f.playOfColor > best.playOfColor ? f : best)).file
    : ''
  const clearest = fires.length > 0
    ? fires.reduce((best, f) => (f.dawnClarity > best.dawnClarity ? f : best)).file
    : ''
  const warmest = fires.length > 0
    ? fires.reduce((best, f) => (f.fireWarmth > best.fireWarmth ? f : best)).file
    : ''
  const mostDiverse = fires.length > 0
    ? fires.reduce((best, f) => (f.spectrumRichness > best.spectrumRichness ? f : best)).file
    : ''
  const mostGlowing = fires.length > 0
    ? fires.reduce((best, f) => (f.opalescenceQuality > best.opalescenceQuality ? f : best)).file
    : ''

  const stats: OpalHorizonStats = {
    totalFiles: files.length,
    totalDeposits: deposits.length,
    avgPlayOfColor,
    avgDawnClarity,
    avgFireWarmth,
    avgSpectrumRichness,
    avgOpalescenceQuality,
    opalMasterpieceCount,
    fireHorizonCount,
    properGemCount,
    dullStoneCount,
    commonRockCount,
    voidCount,
    hasHighColorCount,
    hasHighClarityCount,
    hasHighWarmthCount,
    hasHighRichnessCount,
    hasHighQualityCount,
    overallBrilliance,
    gemologistGrade,
    bestFire,
    mostColorful,
    clearest,
    warmest,
    mostDiverse,
    mostGlowing,
  }

  const celebration = {
    milestone: 570,
    name: 'Opal Horizon',
    message: 'Milestone #570 reached — where the opal horizon meets the dawn sky, every file shimmers with kaleidoscopic brilliance',
  }

  const recommendations = generateRecommendations(fires, deposits, sky, stats)

  return { fires, deposits, sky, stats, celebration, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(fires, deposits, sky, stats) */
export function generateRecommendations(
  fires: OpalFire[],
  deposits: OpalDeposit[],
  sky: OpalHorizonResult['sky'],
  stats: OpalHorizonStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgPlayOfColor >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgFireWarmth >= 90 &&
    stats.avgSpectrumRichness >= 90 &&
    stats.avgOpalescenceQuality >= 90
  ) {
    recs.push(
      'Your opal horizon blazes with transcendent brilliance! Every file is a masterwork of kaleidoscopic perfection',
    )
    return recs
  }

  if (stats.avgPlayOfColor < 60) {
    recs.push(
      'Enhance play of color — code should shimmer with multifaceted quality, revealing different dimensions from every angle',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Brighten dawn clarity — code should illuminate understanding like the first light breaking over the opal horizon',
    )
  }

  if (stats.avgFireWarmth < 60) {
    recs.push(
      'Kindle fire warmth — code should burn with passionate energy, the internal fire that makes opal alive',
    )
  }

  if (stats.avgSpectrumRichness < 60) {
    recs.push(
      'Expand spectrum richness — code should contain the full spectrum of quality, like opal holding every color',
    )
  }

  if (stats.avgOpalescenceQuality < 60) {
    recs.push(
      'Polish opalescence quality — code should glow with that signature diffused light that makes opal magical',
    )
  }

  if (stats.overallBrilliance < 40) {
    recs.push(
      'The horizon dims — rebuild the opal foundation before the light fades entirely',
    )
  }

  const voidFires = fires.filter((f) => f.condition === 'void')
  if (voidFires.length > 0 && voidFires.length <= 5) {
    recs.push(
      `Restore these common rocks: ${voidFires.map((f) => f.file).join(', ')}`,
    )
  } else if (voidFires.length > 5) {
    recs.push(
      `Restore these ${voidFires.length} barren stones before the entire horizon darkens`,
    )
  }

  const poorDeposits = deposits.filter(
    (d) => d.condition === 'void' || d.condition === 'barren-earth',
  )
  if (poorDeposits.length === deposits.length && deposits.length > 0) {
    recs.push(
      'All deposits are barren — consider a complete prospecting expedition to find the opal within',
    )
  }

  if (recs.length === 0) {
    recs.push('Your opal horizon shimmers with prismatic beauty — keep polishing every facet to brilliance')
  }

  return recs
}
