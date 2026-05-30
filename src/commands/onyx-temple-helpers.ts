// ─── Interfaces ──────────────────────────────────────────

export interface RevealingMeasure {
  clarity: number
  obsidian: 'flawless-mirror' | 'polished-black' | 'proper-stone' | 'rough-surface' | 'raw-ore' | 'no-clarity'
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
  hasRevealed: boolean
  hasOpen: boolean
  hasIlluminated: boolean
  hasExpressive: boolean
  hasCommunicative: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  darkness: 'impervious-fortress' | 'dark-stronghold' | 'proper-shade' | 'flickering-shadow' | 'no-cover' | 'no-resilience'
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
  hasHardened: boolean
  hasEnduring: boolean
  hasSolid: boolean
  hasReinforced: boolean
  hasImpervious: boolean
  hasUnshakable: boolean
  unhandledCount: number
  untestedCount: number
}

export interface ReflectingMeasure {
  depth: number
  mirror: 'perfect-reflection' | 'clear-pool' | 'proper-surface' | 'distorted-glass' | 'cracked-mirror' | 'no-depth'
  hasHighDepth: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasDocumented: boolean
  hasSelfAware: boolean
  hasIntrospective: boolean
  hasOrganized: boolean
  hasClean: boolean
  hasModular: boolean
  hasMaintainable: boolean
  hasRefactorable: boolean
  hasSelfContained: boolean
  hasCoherent: boolean
  hasConsistent: boolean
  hasHarmonious: boolean
  hasUnified: boolean
  chaoticCount: number
  undocumentedCount: number
}

export interface CarvingMeasure {
  precision: number
  chisel: 'master-sculptor' | 'expert-mason' | 'proper-carver' | 'rough-hammer' | 'bare-hands' | 'no-precision'
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
  hasCrisp: boolean
  hasDefined: boolean
  hasDetailed: boolean
  hasRefined: boolean
  hasSculpted: boolean
  unsafeCount: number
  approximateCount: number
}

export interface ContemplatingMeasure {
  wisdom: number
  void: 'enlightened-void' | 'deep-emptiness' | 'proper-silence' | 'noise-filled' | 'chaos' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasMinimal: boolean
  hasEssential: boolean
  hasDistilled: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasNoiseFree: boolean
  hasFocused: boolean
  hasPure: boolean
  hasConcentrated: boolean
  hackedCount: number
  noisyCount: number
}

export type PillarCondition =
  | 'onyx-masterpiece'
  | 'dark-cathedral'
  | 'proper-stone'
  | 'cracked-pillar'
  | 'rubble'
  | 'void'

export interface OnyxPillar {
  file: string
  obsidianClarity: number
  darkResilience: number
  mirrorDepth: number
  midnightPrecision: number
  voidWisdom: number
  revealing: RevealingMeasure
  enduring: EnduringMeasure
  reflecting: ReflectingMeasure
  carving: CarvingMeasure
  contemplating: ContemplatingMeasure
  condition: PillarCondition
  qualityScore: number
}

export type NaveType =
  | 'grand-cathedral'
  | 'dark-sanctuary'
  | 'proper-chapel'
  | 'small-shrine'
  | 'empty-room'
  | 'no-nave'

export type NaveCondition =
  | 'onyx-basilica'
  | 'dark-abbey'
  | 'proper-temple'
  | 'ruined-church'
  | 'empty-lot'
  | 'void'

export interface OnyxNave {
  directory: string
  pillars: OnyxPillar[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  onyxMasterpieceCount: number
  voidCount: number
  naveType: NaveType
  condition: NaveCondition
}

export interface OnyxTempleResult {
  pillars: OnyxPillar[]
  naves: OnyxNave[]
  sanctuary: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isOnyx: boolean
    overallDepth: number
  }
  stats: {
    totalFiles: number
    totalNaves: number
    avgObsidianClarity: number
    avgDarkResilience: number
    avgMirrorDepth: number
    avgMidnightPrecision: number
    avgVoidWisdom: number
    onyxMasterpieceCount: number
    darkCathedralCount: number
    properStoneCount: number
    crackedPillarCount: number
    rubbleCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    hasHighDepthCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallDepth: number
    architectGrade: 'master-architect' | 'cathedral-builder' | 'stone-mason' | 'apprentice' | 'novice' | 'sandcastle-builder'
    bestPillar: string
    clearest: string
    mostResilient: string
    deepest: string
    mostPrecise: string
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

/** @example classifyPillarCondition(90) */
export function classifyPillarCondition(score: number): PillarCondition {
  if (score >= 90) return 'onyx-masterpiece'
  if (score >= 75) return 'dark-cathedral'
  if (score >= 60) return 'proper-stone'
  if (score >= 40) return 'cracked-pillar'
  if (score >= 20) return 'rubble'
  return 'void'
}

/** @example classifyNaveType(pillars) */
export function classifyNaveType(pillars: OnyxPillar[]): NaveType {
  if (pillars.length === 0) return 'no-nave'
  const avg =
    pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length
  if (avg >= 85) return 'grand-cathedral'
  if (avg >= 70) return 'dark-sanctuary'
  if (avg >= 55) return 'proper-chapel'
  if (avg >= 35) return 'small-shrine'
  return 'empty-room'
}

/** @example classifyNaveCondition(85) */
export function classifyNaveCondition(score: number): NaveCondition {
  if (score >= 85) return 'onyx-basilica'
  if (score >= 70) return 'dark-abbey'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'ruined-church'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(
  avgDepth: number,
): OnyxTempleResult['stats']['architectGrade'] {
  if (avgDepth >= 80) return 'master-architect'
  if (avgDepth >= 65) return 'cathedral-builder'
  if (avgDepth >= 50) return 'stone-mason'
  if (avgDepth >= 35) return 'apprentice'
  if (avgDepth >= 20) return 'novice'
  return 'sandcastle-builder'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRevealing('const x: string = ""') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obscure|arcane)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = !/\bany\b/.test(content)
  const hasClear = /\b(function|=>|return)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscated|encoded|mangled)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasVisible = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDirect = /\b(try|catch|if)\b/.test(content)
  const hasRevealed = /\b(readonly|as const)\b/.test(content)
  const hasOpen = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasExpressive = /\b(async|await|Promise)\b/.test(content)
  const hasCommunicative = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0

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
    hasRevealed,
    hasOpen,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let obsidian: RevealingMeasure['obsidian'] = 'no-clarity'
  if (clarity >= 90) obsidian = 'flawless-mirror'
  else if (clarity >= 75) obsidian = 'polished-black'
  else if (clarity >= 60) obsidian = 'proper-stone'
  else if (clarity >= 40) obsidian = 'rough-surface'
  else if (clarity >= 20) obsidian = 'raw-ore'

  return {
    clarity,
    obsidian,
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
    hasRevealed,
    hasOpen,
    hasIlluminated,
    hasExpressive,
    hasCommunicative,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureEnduring('try { x() } catch { y() }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|throw)\b/.test(content)
  const unhandledCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|readonly|const)\b/.test(content)
  const hasRobust = /\b(class|interface|type)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = !/\bany\b/.test(content)
  const hasNoUnsafe = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(import|export)\b/.test(content)
  const hasSolid = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasReinforced = /\b(readonly|private|protected)\b/.test(content)
  const hasImpervious = (content.match(/\b(volatile|unstable|fragile)\b/gi) ?? []).length === 0
  const hasUnshakable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

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
    hasHardened,
    hasEnduring,
    hasSolid,
    hasReinforced,
    hasImpervious,
    hasUnshakable,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let darkness: EnduringMeasure['darkness'] = 'no-resilience'
  if (resilience >= 90) darkness = 'impervious-fortress'
  else if (resilience >= 75) darkness = 'dark-stronghold'
  else if (resilience >= 60) darkness = 'proper-shade'
  else if (resilience >= 40) darkness = 'flickering-shadow'
  else if (resilience >= 20) darkness = 'no-cover'

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
    hasHardened,
    hasEnduring,
    hasSolid,
    hasReinforced,
    hasImpervious,
    hasUnshakable,
    unhandledCount,
    untestedCount,
  }
}

/** @example measureReflecting('class X { readonly y: string }') */
export function measureReflecting(content: string): ReflectingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSelfAware = /\b(readonly|private|protected)\b/.test(content)
  const hasIntrospective = /\b(readonly|as const)\b/.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasModular = /\b(async|await|Promise)\b/.test(content)
  const hasMaintainable = !/\bany\b/.test(content)
  const hasRefactorable = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasSelfContained = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasCoherent = /\b(function|=>|return)\b/.test(content)
  const hasConsistent = /\b(const|readonly)\b/.test(content)
  const hasHarmonious = /\b(try|catch|if)\b/.test(content)
  const hasUnified = /\b(return|throw)\b/.test(content)
  const undocumentedCount = 0

  const positiveBooleans = [
    hasWellStructured,
    hasNoChaotic,
    hasDocumented,
    hasSelfAware,
    hasIntrospective,
    hasOrganized,
    hasClean,
    hasModular,
    hasMaintainable,
    hasRefactorable,
    hasSelfContained,
    hasCoherent,
    hasConsistent,
    hasHarmonious,
    hasUnified,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let mirror: ReflectingMeasure['mirror'] = 'no-depth'
  if (depth >= 90) mirror = 'perfect-reflection'
  else if (depth >= 75) mirror = 'clear-pool'
  else if (depth >= 60) mirror = 'proper-surface'
  else if (depth >= 40) mirror = 'distorted-glass'
  else if (depth >= 20) mirror = 'cracked-mirror'

  return {
    depth,
    mirror,
    hasHighDepth,
    hasWellStructured,
    hasNoChaotic,
    hasDocumented,
    hasSelfAware,
    hasIntrospective,
    hasOrganized,
    hasClean,
    hasModular,
    hasMaintainable,
    hasRefactorable,
    hasSelfContained,
    hasCoherent,
    hasConsistent,
    hasHarmonious,
    hasUnified,
    chaoticCount,
    undocumentedCount,
  }
}

/** @example measureCarving('const x: string = ""') */
export function measureCarving(content: string): CarvingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(roughly|approximately|guesstimate)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(readonly|as const)\b/.test(content)
  const hasClean = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasPrecise = /\b(class|interface|type)\b/.test(content)
  const hasCorrect = /\b(import|export)\b/.test(content)
  const hasFaithful = /\b(const|readonly)\b/.test(content)
  const hasSharp = /\b(readonly|private|protected)\b/.test(content)
  const hasCrisp = /\b(function|=>|return)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDetailed = /\b(try|catch|if)\b/.test(content)
  const hasRefined = /\b(async|await|Promise)\b/.test(content)
  const hasSculpted = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0

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
    hasCrisp,
    hasDefined,
    hasDetailed,
    hasRefined,
    hasSculpted,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let chisel: CarvingMeasure['chisel'] = 'no-precision'
  if (precision >= 90) chisel = 'master-sculptor'
  else if (precision >= 75) chisel = 'expert-mason'
  else if (precision >= 60) chisel = 'proper-carver'
  else if (precision >= 40) chisel = 'rough-hammer'
  else if (precision >= 20) chisel = 'bare-hands'

  return {
    precision,
    chisel,
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
    hasCrisp,
    hasDefined,
    hasDetailed,
    hasRefined,
    hasSculpted,
    unsafeCount,
    approximateCount,
  }
}

/** @example measureContemplating('export interface X { readonly y: string }') */
export function measureContemplating(content: string): ContemplatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMinimal = !/\bany\b/.test(content)
  const hasEssential = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasDistilled = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasProven = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasMature = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\b(try|catch|if)\b/.test(content)
  const hasNoiseFree = (content.match(/\b(monolithic|god.object|mega)\b/gi) ?? []).length === 0
  const hasFocused = /\b(readonly|as const)\b/.test(content)
  const hasPure = /\b(return|throw)\b/.test(content)
  const hasConcentrated = /\b(function|=>)\b/.test(content)
  const noisyCount = (content.match(/\b(noisy|cluttered|bloated)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasMinimal,
    hasEssential,
    hasDistilled,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasNoiseFree,
    hasFocused,
    hasPure,
    hasConcentrated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let voidLevel: ContemplatingMeasure['void'] = 'no-wisdom'
  if (wisdom >= 90) voidLevel = 'enlightened-void'
  else if (wisdom >= 75) voidLevel = 'deep-emptiness'
  else if (wisdom >= 60) voidLevel = 'proper-silence'
  else if (wisdom >= 40) voidLevel = 'noise-filled'
  else if (wisdom >= 20) voidLevel = 'chaos'

  return {
    wisdom,
    void: voidLevel,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasDeep,
    hasMinimal,
    hasEssential,
    hasDistilled,
    hasProven,
    hasMature,
    hasStrategic,
    hasInsightful,
    hasNoiseFree,
    hasFocused,
    hasPure,
    hasConcentrated,
    hackedCount,
    noisyCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeOnyxPillar(content, 'app.ts') */
export function analyzeOnyxPillar(content: string, filePath: string): OnyxPillar {
  const revealing = measureRevealing(content)
  const enduring = measureEnduring(content)
  const reflecting = measureReflecting(content)
  const carving = measureCarving(content)
  const contemplating = measureContemplating(content)

  const obsidianClarity = revealing.clarity
  const darkResilience = enduring.resilience
  const mirrorDepth = reflecting.depth
  const midnightPrecision = carving.precision
  const voidWisdom = contemplating.wisdom

  const qualityScore = Math.round(
    obsidianClarity * 0.2 +
    darkResilience * 0.2 +
    mirrorDepth * 0.2 +
    midnightPrecision * 0.2 +
    voidWisdom * 0.2,
  )

  const condition = classifyPillarCondition(qualityScore)

  return {
    file: filePath,
    obsidianClarity,
    darkResilience,
    mirrorDepth,
    midnightPrecision,
    voidWisdom,
    revealing,
    enduring,
    reflecting,
    carving,
    contemplating,
    condition,
    qualityScore,
  }
}

/** @example analyzeOnyxNave(pillars, 'src') */
export function analyzeOnyxNave(pillars: OnyxPillar[], dirPath: string): OnyxNave {
  if (pillars.length === 0) {
    return {
      directory: dirPath,
      pillars: [],
      avgClarity: 0,
      avgPrecision: 0,
      avgWisdom: 0,
      onyxMasterpieceCount: 0,
      voidCount: 0,
      naveType: 'no-nave',
      condition: 'void',
    }
  }

  const avgClarity = Math.round(
    pillars.reduce((s, p) => s + p.obsidianClarity, 0) / pillars.length,
  )
  const avgPrecision = Math.round(
    pillars.reduce((s, p) => s + p.midnightPrecision, 0) / pillars.length,
  )
  const avgWisdom = Math.round(
    pillars.reduce((s, p) => s + p.voidWisdom, 0) / pillars.length,
  )

  const onyxMasterpieceCount = pillars.filter(
    (p) => p.condition === 'onyx-masterpiece',
  ).length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const naveType = classifyNaveType(pillars)
  const avgQuality = Math.round(
    pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length,
  )
  const condition = classifyNaveCondition(avgQuality)

  return {
    directory: dirPath,
    pillars,
    avgClarity,
    avgPrecision,
    avgWisdom,
    onyxMasterpieceCount,
    voidCount,
    naveType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildOnyxTempleResult(['a.ts'], [content]) */
export async function buildOnyxTempleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<OnyxTempleResult> {
  const pillars: OnyxPillar[] = files.map((file, i) =>
    analyzeOnyxPillar(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, OnyxPillar[]>()
  for (const pillar of pillars) {
    const dir = pillar.file.includes('/')
      ? pillar.file.substring(0, pillar.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(pillar)
    } else {
      dirMap.set(dir, [pillar])
    }
  }

  const naves: OnyxNave[] = Array.from(dirMap.entries()).map(([dir, dirPillars]) =>
    analyzeOnyxNave(dirPillars, dir),
  )

  const avgClarity =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.obsidianClarity, 0) / pillars.length)
      : 0
  const avgPrecision =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.midnightPrecision, 0) / pillars.length)
      : 0
  const avgWisdom =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.voidWisdom, 0) / pillars.length)
      : 0

  const overallDepth =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.qualityScore, 0) / pillars.length)
      : 0
  const isOnyx = overallDepth >= 60

  const sanctuary = { avgClarity, avgPrecision, avgWisdom, isOnyx, overallDepth }

  const avgObsidianClarity = avgClarity
  const avgDarkResilience =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.darkResilience, 0) / pillars.length)
      : 0
  const avgMirrorDepth =
    pillars.length > 0
      ? Math.round(pillars.reduce((s, p) => s + p.mirrorDepth, 0) / pillars.length)
      : 0
  const avgMidnightPrecision = avgPrecision
  const avgVoidWisdom = avgWisdom

  const onyxMasterpieceCount = pillars.filter(
    (p) => p.condition === 'onyx-masterpiece',
  ).length
  const darkCathedralCount = pillars.filter(
    (p) => p.condition === 'dark-cathedral',
  ).length
  const properStoneCount = pillars.filter(
    (p) => p.condition === 'proper-stone',
  ).length
  const crackedPillarCount = pillars.filter(
    (p) => p.condition === 'cracked-pillar',
  ).length
  const rubbleCount = pillars.filter(
    (p) => p.condition === 'rubble',
  ).length
  const voidCount = pillars.filter((p) => p.condition === 'void').length

  const hasHighClarityCount = pillars.filter(
    (p) => p.revealing.hasHighClarity,
  ).length
  const hasHighResilienceCount = pillars.filter(
    (p) => p.enduring.hasHighResilience,
  ).length
  const hasHighDepthCount = pillars.filter(
    (p) => p.reflecting.hasHighDepth,
  ).length
  const hasHighPrecisionCount = pillars.filter(
    (p) => p.carving.hasHighPrecision,
  ).length
  const hasHighWisdomCount = pillars.filter(
    (p) => p.contemplating.hasHighWisdom,
  ).length

  const architectGrade = classifyArchitectGrade(overallDepth)

  const bestPillar = pillars.length > 0
    ? pillars.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const clearest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.obsidianClarity > best.obsidianClarity ? p : best)).file
    : ''
  const mostResilient = pillars.length > 0
    ? pillars.reduce((best, p) => (p.darkResilience > best.darkResilience ? p : best)).file
    : ''
  const deepest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.mirrorDepth > best.mirrorDepth ? p : best)).file
    : ''
  const mostPrecise = pillars.length > 0
    ? pillars.reduce((best, p) => (p.midnightPrecision > best.midnightPrecision ? p : best)).file
    : ''
  const wisest = pillars.length > 0
    ? pillars.reduce((best, p) => (p.voidWisdom > best.voidWisdom ? p : best)).file
    : ''

  const stats: OnyxTempleResult['stats'] = {
    totalFiles: files.length,
    totalNaves: naves.length,
    avgObsidianClarity,
    avgDarkResilience,
    avgMirrorDepth,
    avgMidnightPrecision,
    avgVoidWisdom,
    onyxMasterpieceCount,
    darkCathedralCount,
    properStoneCount,
    crackedPillarCount,
    rubbleCount,
    voidCount,
    hasHighClarityCount,
    hasHighResilienceCount,
    hasHighDepthCount,
    hasHighPrecisionCount,
    hasHighWisdomCount,
    overallDepth,
    architectGrade,
    bestPillar,
    clearest,
    mostResilient,
    deepest,
    mostPrecise,
    wisest,
  }

  const recommendations = generateRecommendations(pillars, naves, sanctuary, stats)

  return { pillars, naves, sanctuary, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(pillars, naves, sanctuary, stats) */
export function generateRecommendations(
  pillars: OnyxPillar[],
  naves: OnyxNave[],
  _sanctuary: OnyxTempleResult['sanctuary'],
  stats: OnyxTempleResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgObsidianClarity >= 90 &&
    stats.avgDarkResilience >= 90 &&
    stats.avgMirrorDepth >= 90 &&
    stats.avgMidnightPrecision >= 90 &&
    stats.avgVoidWisdom >= 90
  ) {
    recs.push(
      'Your onyx temple is a masterpiece carved from pure darkness! Every pillar reflects the depth of master craftsmanship through obsidian clarity!',
    )
    return recs
  }

  if (stats.avgObsidianClarity < 60) {
    recs.push(
      'Polish the obsidian clarity — onyx reveals its hidden bands when properly worked; your code should be transparent even in its darkest complexity',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Strengthen the dark resilience — darkness is not the absence of light but the presence of potential; your code must stand firm against the unknown',
    )
  }

  if (stats.avgMirrorDepth < 60) {
    recs.push(
      'Deepen the mirror depth — polished onyx reflects perfectly, showing every detail; your code should possess profound self-awareness',
    )
  }

  if (stats.avgMidnightPrecision < 60) {
    recs.push(
      'Sharpen the midnight precision — cathedrals demand millimeter accuracy; every line of your code should be carved with sculptor intent',
    )
  }

  if (stats.avgVoidWisdom < 60) {
    recs.push(
      'Cultivate the void wisdom — emptiness is where understanding begins; strip away noise to reveal the essential truths in your code',
    )
  }

  if (stats.overallDepth < 40) {
    recs.push(
      'The temple lies in ruins — until the first onyx pillar rises from the darkness, no cathedral can be built',
    )
  }

  const voidPillars = pillars.filter((p) => p.condition === 'void')
  if (voidPillars.length > 0 && voidPillars.length <= 5) {
    recs.push(
      `Re-examine these rubble piles: ${voidPillars.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPillars.length > 5) {
    recs.push(
      `Re-examine these ${voidPillars.length} rubble piles before the entire temple collapses`,
    )
  }

  const poorNaves = naves.filter(
    (n) => n.condition === 'void' || n.condition === 'empty-lot',
  )
  if (poorNaves.length === naves.length && naves.length > 0) {
    recs.push(
      'All naves have crumbled to empty lots — the onyx temple needs a complete reconstruction',
    )
  }

  if (recs.length === 0) {
    recs.push('Your onyx temple stands as a monument in the darkness — each pillar carved with precision, reflecting wisdom from polished obsidian surfaces')
  }

  return recs
}
