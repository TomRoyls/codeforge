// ─── Interfaces ──────────────────────────────────────────

export interface AgingMeasure {
  wisdom: number
  patina:
    | 'noble-verdigris'
    | 'aged-copper'
    | 'proper-patina'
    | 'tarnished-metal'
    | 'raw-copper'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasEstablished: boolean
  hasNoNovel: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasTimeless: boolean
  hasPrincipled: boolean
  hasEnduring: boolean
  undocumentedCount: number
  experimentalCount: number
}

export interface KindlingMeasure {
  clarity: number
  dawn:
    | 'rose-gold-dawn'
    | 'copper-morning'
    | 'proper-light'
    | 'foggy-dawn'
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
  hasDirect: boolean
  hasNoCircuits: boolean
  hasPurpose: boolean
  hasFocused: boolean
  hasIlluminated: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface ConnectingMeasure {
  conductivity: number
  wire:
    | 'superconductor'
    | 'high-conductivity'
    | 'proper-wire'
    | 'resistive-wire'
    | 'insulator'
    | 'no-conductivity'
  hasHighConductivity: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasConnected: boolean
  hasNoOrphaned: boolean
  hasEfficient: boolean
  hasNoBottlenecked: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasLinked: boolean
  hasIntegrated: boolean
  hasFlowing: boolean
  isolatedCount: number
  tangledCount: number
}

export interface ComfortingMeasure {
  resilience: number
  warmth:
    | 'warm-glow'
    | 'comforting-heat'
    | 'proper-warmth'
    | 'lukewarm'
    | 'cold-metal'
    | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasGraceful: boolean
  hasNoHarshFail: boolean
  hasRecoverable: boolean
  hasNoFatal: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasCaring: boolean
  hasTypeSafe: boolean
  hasEnduring: boolean
  bareCrashCount: number
  untestedCount: number
}

export interface GroundingMeasure {
  strength: number
  forge:
    | 'primordial-forge'
    | 'strong-anvil'
    | 'proper-forge'
    | 'weak-flame'
    | 'cold-hearth'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasFoundational: boolean
  hasArchitectural: boolean
  hasSolid: boolean
  hasProven: boolean
  hasRobust: boolean
  hasRooted: boolean
  hasEnduring: boolean
  chaoticCount: number
  adHocCount: number
}

export type RayCondition =
  | 'copper-masterpiece'
  | 'rose-gold-dawn'
  | 'proper-metal'
  | 'tarnished-bronze'
  | 'rusted-iron'
  | 'void'

export interface CopperRay {
  file: string
  patinaWisdom: number
  dawnClarity: number
  conductivityQuality: number
  warmthResilience: number
  forgeStrength: number
  aging: AgingMeasure
  kindling: KindlingMeasure
  connecting: ConnectingMeasure
  comforting: ComfortingMeasure
  grounding: GroundingMeasure
  condition: RayCondition
  qualityScore: number
}

export type HearthType =
  | 'ancient-forge'
  | 'copper-hearth'
  | 'proper-fire'
  | 'small-flame'
  | 'cold-ash'
  | 'no-hearth'

export type HearthCondition =
  | 'copper-temple'
  | 'warm-forge'
  | 'proper-hearth'
  | 'dying-ember'
  | 'cold-ash'
  | 'void'

export interface CopperHearth {
  directory: string
  rays: CopperRay[]
  avgWisdom: number
  avgConductivity: number
  avgStrength: number
  copperMasterpieceCount: number
  voidCount: number
  hearthType: HearthType
  condition: HearthCondition
}

export type SmithGrade =
  | 'copper-sage'
  | 'dawn-smith'
  | 'wire-master'
  | 'apprentice'
  | 'novice'
  | 'cold-hands'

export interface CopperMorningStats {
  totalFiles: number
  totalHearths: number
  avgPatinaWisdom: number
  avgDawnClarity: number
  avgConductivityQuality: number
  avgWarmthResilience: number
  avgForgeStrength: number
  copperMasterpieceCount: number
  roseGoldDawnCount: number
  properMetalCount: number
  tarnishedBronzeCount: number
  rustedIronCount: number
  voidCount: number
  hasHighWisdomCount: number
  hasHighClarityCount: number
  hasHighConductivityCount: number
  hasHighResilienceCount: number
  hasHighStrengthCount: number
  overallWarmth: number
  smithGrade: SmithGrade
  bestRay: string
  wisest: string
  clearest: string
  mostConnected: string
  warmest: string
  strongest: string
}

export interface CopperMorningResult {
  rays: CopperRay[]
  hearths: CopperHearth[]
  morning: {
    avgWisdom: number
    avgConductivity: number
    avgStrength: number
    isCopper: boolean
    overallWarmth: number
  }
  stats: CopperMorningStats
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

/** @example measureAging('export class Analyzer { }') */
export function measureAging(content: string): AgingMeasure {
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bTODO|FIXME|HACK\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\b(experimental|beta|alpha)\b/gi) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasEstablished = /\b(function|class|interface)\b/.test(content)
  const hasNoNovel = !/\b(novel|experimental|prototype)\b/i.test(content)
  const hasMaintained = /\b(import|export|from)\b/.test(content)
  const hasNoAbandoned = !/\b(abandoned|deprecated|legacy)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasTimeless = /\b(try|catch|if|throw)\b/.test(content)
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasDocumented,
    hasProven,
    hasMature,
    hasEstablished,
    hasMaintained,
    hasStable,
    hasTimeless,
    hasEnduring,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const patina = classifyPatina(wisdom)

  return {
    wisdom,
    patina,
    hasHighWisdom,
    hasDocumented,
    hasNoUndocumented,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasEstablished,
    hasNoNovel,
    hasMaintained,
    hasNoAbandoned,
    hasStable,
    hasNoVolatile,
    hasTimeless,
    hasPrincipled,
    hasEnduring,
    undocumentedCount,
    experimentalCount,
  }
}

/** @example measureKindling('export function analyze(): void { }') */
export function measureKindling(content: string): KindlingMeasure {
  const hasReadable = /\b(const|let|function|class)\b/.test(content)
  const crypticCount = (content.match(/\b[a-z]\b(?=\s*[=+\-*/])/g) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(readonly|private|protected|async)\b/.test(content)
  const hasNoMystery = !/\b(mystery|magic|unexplained)\b/i.test(content)
  const hasClear = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minify|uglify)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(import|export|from)\b/.test(content)
  const hasNoHidden = !content.includes('@ts-ignore')
  const hasUnderstandable = /\b(if|return|throw)\b/.test(content)
  const hasNoArcane = !/\b(arcane|esoteric|cryptic)\b/i.test(content)
  const hasDirect = /\b(return|yield|emit)\b/.test(content)
  const hasNoCircuits = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasPurpose = /\b(export)\b/.test(content)
  const hasFocused = /\b(readonly|const)\b/.test(content)
  const hasIlluminated = /\b(try|catch)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasDirect,
    hasPurpose,
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
    hasDirect,
    hasNoCircuits,
    hasPurpose,
    hasFocused,
    hasIlluminated,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureConnecting('export class Analyzer<T> { }') */
export function measureConnecting(content: string): ConnectingMeasure {
  const hasExported = /\bexport\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|standalone|orphaned)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasCleanPipelines = /\b(import|export|from)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|messy)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasConnected = /\b(import|export)\b/.test(content)
  const hasNoOrphaned = !/\b(orphaned|unused|dead)\b/i.test(content)
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoBottlenecked = !/\b(bottleneck|blocked|stuck)\b/i.test(content)
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoScattered = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasLinked = /\b(type|interface|<\w+>)\b/.test(content)
  const hasIntegrated = /\b(function|class|interface)\b/.test(content)
  const hasFlowing = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasCleanPipelines,
    hasModular,
    hasConnected,
    hasEfficient,
    hasOrganized,
    hasLinked,
    hasFlowing,
  ]

  const conductivity = computeScore(positiveBooleans)
  const hasHighConductivity = conductivity >= 60
  const wire = classifyWire(conductivity)

  return {
    conductivity,
    wire,
    hasHighConductivity,
    hasExported,
    hasNoIsolated,
    hasCleanPipelines,
    hasNoTangled,
    hasModular,
    hasNoMonolithic,
    hasConnected,
    hasNoOrphaned,
    hasEfficient,
    hasNoBottlenecked,
    hasOrganized,
    hasNoScattered,
    hasLinked,
    hasIntegrated,
    hasFlowing,
    isolatedCount,
    tangledCount,
  }
}

/** @example measureComforting('try { analyze() } catch { recover() }') */
export function measureComforting(content: string): ComfortingMeasure {
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashCount = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashCount === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasGraceful = /\b(catch|finally|default)\b/.test(content)
  const hasNoHarshFail = !/\b(abort|kill|terminate)\b/i.test(content)
  const hasRecoverable = /\b(try|catch|Error|throw)\b/.test(content)
  const hasNoFatal = !/\b(fatal|panic|crash)\b/i.test(content)
  const hasRobust = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasCaring = /\b(readonly|private|protected)\b/.test(content)
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasTested,
    hasCaring,
    hasEnduring,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60
  const warmth = classifyWarmth(resilience)

  return {
    resilience,
    warmth,
    hasHighResilience,
    hasErrorHandled,
    hasNoBareCrash,
    hasDefensive,
    hasNoNaive,
    hasGraceful,
    hasNoHarshFail,
    hasRecoverable,
    hasNoFatal,
    hasRobust,
    hasNoFragile,
    hasTested,
    hasNoUntested,
    hasCaring,
    hasTypeSafe,
    hasEnduring,
    bareCrashCount,
    untestedCount,
  }
}

/** @example measureGrounding('export interface Config { readonly name: string }') */
export function measureGrounding(content: string): GroundingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasFoundational = /\b(import|export|from)\b/.test(content)
  const hasArchitectural = /\b(try|catch|if|throw)\b/.test(content)
  const hasSolid = /\b(const|readonly)\b/.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasRobust = /\b(async|await|Promise)\b/.test(content)
  const hasRooted = /\b(function|class|=|=>|async)\b/.test(content)
  const hasEnduring = /\b(return|export|yield)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasPrincipled,
    hasPatterned,
    hasDeep,
    hasFoundational,
    hasSolid,
    hasProven,
    hasEnduring,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60
  const forge = classifyForge(strength)

  return {
    strength,
    forge,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasPrincipled,
    hasNoAdHoc,
    hasPatterned,
    hasNoReinvented,
    hasDeep,
    hasNoShallow,
    hasFoundational,
    hasArchitectural,
    hasSolid,
    hasProven,
    hasRobust,
    hasRooted,
    hasEnduring,
    chaoticCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyPatina(score: number): AgingMeasure['patina'] {
  if (score >= 90) return 'noble-verdigris'
  if (score >= 75) return 'aged-copper'
  if (score >= 60) return 'proper-patina'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'raw-copper'
  return 'no-wisdom'
}

function classifyDawn(score: number): KindlingMeasure['dawn'] {
  if (score >= 90) return 'rose-gold-dawn'
  if (score >= 75) return 'copper-morning'
  if (score >= 60) return 'proper-light'
  if (score >= 40) return 'foggy-dawn'
  if (score >= 20) return 'dark-night'
  return 'no-clarity'
}

function classifyWire(score: number): ConnectingMeasure['wire'] {
  if (score >= 90) return 'superconductor'
  if (score >= 75) return 'high-conductivity'
  if (score >= 60) return 'proper-wire'
  if (score >= 40) return 'resistive-wire'
  if (score >= 20) return 'insulator'
  return 'no-conductivity'
}

function classifyWarmth(score: number): ComfortingMeasure['warmth'] {
  if (score >= 90) return 'warm-glow'
  if (score >= 75) return 'comforting-heat'
  if (score >= 60) return 'proper-warmth'
  if (score >= 40) return 'lukewarm'
  if (score >= 20) return 'cold-metal'
  return 'no-resilience'
}

function classifyForge(score: number): GroundingMeasure['forge'] {
  if (score >= 90) return 'primordial-forge'
  if (score >= 75) return 'strong-anvil'
  if (score >= 60) return 'proper-forge'
  if (score >= 40) return 'weak-flame'
  if (score >= 20) return 'cold-hearth'
  return 'no-strength'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): RayCondition {
  if (score >= 90) return 'copper-masterpiece'
  if (score >= 75) return 'rose-gold-dawn'
  if (score >= 60) return 'proper-metal'
  if (score >= 40) return 'tarnished-bronze'
  if (score >= 20) return 'rusted-iron'
  return 'void'
}

/** @example classifyHearthType(rays) */
export function classifyHearthType(rays: CopperRay[]): HearthType {
  if (rays.length === 0) return 'no-hearth'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 90) return 'ancient-forge'
  if (avg >= 75) return 'copper-hearth'
  if (avg >= 60) return 'proper-fire'
  if (avg >= 40) return 'small-flame'
  if (avg >= 20) return 'cold-ash'
  return 'no-hearth'
}

/** @example classifyHearthCondition(avgWisdom) */
export function classifyHearthCondition(avgWisdom: number): HearthCondition {
  if (avgWisdom >= 85) return 'copper-temple'
  if (avgWisdom >= 70) return 'warm-forge'
  if (avgWisdom >= 55) return 'proper-hearth'
  if (avgWisdom >= 35) return 'dying-ember'
  if (avgWisdom >= 15) return 'cold-ash'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgWarmth: number): SmithGrade {
  if (avgWarmth >= 80) return 'copper-sage'
  if (avgWarmth >= 65) return 'dawn-smith'
  if (avgWarmth >= 50) return 'wire-master'
  if (avgWarmth >= 35) return 'apprentice'
  if (avgWarmth >= 20) return 'novice'
  return 'cold-hands'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeCopperRay(content, 'app.ts') */
export function analyzeCopperRay(content: string, filePath: string): CopperRay {
  const aging = measureAging(content)
  const kindling = measureKindling(content)
  const connecting = measureConnecting(content)
  const comforting = measureComforting(content)
  const grounding = measureGrounding(content)

  const patinaWisdom = aging.wisdom
  const dawnClarity = kindling.clarity
  const conductivityQuality = connecting.conductivity
  const warmthResilience = comforting.resilience
  const forgeStrength = grounding.strength

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
    kindling,
    connecting,
    comforting,
    grounding,
    condition,
    qualityScore,
  }
}

/** @example analyzeCopperHearth(rays, 'src') */
export function analyzeCopperHearth(rays: CopperRay[], dirPath: string): CopperHearth {
  if (rays.length === 0) {
    return {
      directory: dirPath,
      rays: [],
      avgWisdom: 0,
      avgConductivity: 0,
      avgStrength: 0,
      copperMasterpieceCount: 0,
      voidCount: 0,
      hearthType: 'no-hearth',
      condition: 'void',
    }
  }

  const avgWisdom = Math.round(
    rays.reduce((s, r) => s + r.patinaWisdom, 0) / rays.length,
  )
  const avgConductivity = Math.round(
    rays.reduce((s, r) => s + r.conductivityQuality, 0) / rays.length,
  )
  const avgStrength = Math.round(
    rays.reduce((s, r) => s + r.forgeStrength, 0) / rays.length,
  )

  const copperMasterpieceCount = rays.filter(
    (r) => r.condition === 'copper-masterpiece',
  ).length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hearthType = classifyHearthType(rays)
  const avgQuality = Math.round(
    rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length,
  )
  const condition = classifyHearthCondition(avgQuality)

  return {
    directory: dirPath,
    rays,
    avgWisdom,
    avgConductivity,
    avgStrength,
    copperMasterpieceCount,
    voidCount,
    hearthType,
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
  const rays: CopperRay[] = files.map((file, i) =>
    analyzeCopperRay(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperRay[]>()
  for (const ray of rays) {
    const dir = ray.file.includes('/')
      ? ray.file.substring(0, ray.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(ray)
    } else {
      dirMap.set(dir, [ray])
    }
  }

  const hearths: CopperHearth[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeCopperHearth(dirRays, dir),
  )

  const avgWisdom =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.patinaWisdom, 0) / rays.length)
      : 0
  const avgConductivity =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.conductivityQuality, 0) / rays.length)
      : 0
  const avgStrength =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.forgeStrength, 0) / rays.length)
      : 0

  const overallWarmth =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
      : 0
  const isCopper = overallWarmth >= 60

  const morning = { avgWisdom, avgConductivity, avgStrength, isCopper, overallWarmth }

  const avgPatinaWisdom = avgWisdom
  const avgDawnClarity =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.dawnClarity, 0) / rays.length)
      : 0
  const avgConductivityQuality = avgConductivity
  const avgWarmthResilience =
    rays.length > 0
      ? Math.round(rays.reduce((s, r) => s + r.warmthResilience, 0) / rays.length)
      : 0
  const avgForgeStrength = avgStrength

  const copperMasterpieceCount = rays.filter(
    (r) => r.condition === 'copper-masterpiece',
  ).length
  const roseGoldDawnCount = rays.filter((r) => r.condition === 'rose-gold-dawn').length
  const properMetalCount = rays.filter((r) => r.condition === 'proper-metal').length
  const tarnishedBronzeCount = rays.filter((r) => r.condition === 'tarnished-bronze').length
  const rustedIronCount = rays.filter((r) => r.condition === 'rusted-iron').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighWisdomCount = rays.filter((r) => r.aging.hasHighWisdom).length
  const hasHighClarityCount = rays.filter((r) => r.kindling.hasHighClarity).length
  const hasHighConductivityCount = rays.filter((r) => r.connecting.hasHighConductivity).length
  const hasHighResilienceCount = rays.filter((r) => r.comforting.hasHighResilience).length
  const hasHighStrengthCount = rays.filter((r) => r.grounding.hasHighStrength).length

  const smithGrade = classifySmithGrade(overallWarmth)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file
    : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.patinaWisdom > best.patinaWisdom ? r : best)).file
    : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => (r.dawnClarity > best.dawnClarity ? r : best)).file
    : ''
  const mostConnected = rays.length > 0
    ? rays.reduce((best, r) => (r.conductivityQuality > best.conductivityQuality ? r : best)).file
    : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => (r.warmthResilience > best.warmthResilience ? r : best)).file
    : ''
  const strongest = rays.length > 0
    ? rays.reduce((best, r) => (r.forgeStrength > best.forgeStrength ? r : best)).file
    : ''

  const stats: CopperMorningStats = {
    totalFiles: files.length,
    totalHearths: hearths.length,
    avgPatinaWisdom,
    avgDawnClarity,
    avgConductivityQuality,
    avgWarmthResilience,
    avgForgeStrength,
    copperMasterpieceCount,
    roseGoldDawnCount,
    properMetalCount,
    tarnishedBronzeCount,
    rustedIronCount,
    voidCount,
    hasHighWisdomCount,
    hasHighClarityCount,
    hasHighConductivityCount,
    hasHighResilienceCount,
    hasHighStrengthCount,
    overallWarmth,
    smithGrade,
    bestRay,
    wisest,
    clearest,
    mostConnected,
    warmest,
    strongest,
  }

  const recommendations = generateRecommendations(rays, hearths, morning, stats)

  return { rays, hearths, morning, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, hearths, morning, stats) */
export function generateRecommendations(
  rays: CopperRay[],
  hearths: CopperHearth[],
  morning: CopperMorningResult['morning'],
  stats: CopperMorningStats,
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
      'Your copper dawn is a masterwork of warm wisdom! Every ray carries the patina of ages and the promise of a new morning',
    )
    return recs
  }

  if (stats.avgPatinaWisdom < 60) {
    recs.push(
      'Grow patina wisdom — code should gain character with age, like copper developing its noble verdigris',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Brighten the dawn clarity — code should begin each cycle with clear purpose, like copper catching the first light of morning',
    )
  }

  if (stats.avgConductivityQuality < 60) {
    recs.push(
      'Improve conductivity quality — code should connect systems efficiently, like copper wire carrying current without resistance',
    )
  }

  if (stats.avgWarmthResilience < 60) {
    recs.push(
      'Build warmth resilience — code should maintain caring quality under pressure, like copper that holds warmth long after the fire fades',
    )
  }

  if (stats.avgForgeStrength < 60) {
    recs.push(
      'Strengthen the forge — code should build on foundational power, like copper that was humanity\'s first forged metal',
    )
  }

  if (stats.overallWarmth < 40) {
    recs.push(
      'The copper grows cold — rekindle the forge before the hearth dies completely',
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(
      `Reforge these cold rays: ${voidRays.map((r) => r.file).join(', ')}`,
    )
  } else if (voidRays.length > 5) {
    recs.push(
      `Reforge these ${voidRays.length} cold rays before the entire hearth goes dark`,
    )
  }

  const poorHearths = hearths.filter(
    (h) => h.condition === 'void' || h.condition === 'cold-ash',
  )
  if (poorHearths.length === hearths.length && hearths.length > 0) {
    recs.push(
      'All hearths have gone cold — the copper dawn needs a complete reignition from scratch',
    )
  }

  if (recs.length === 0) {
    recs.push('Your copper dawn glows with warm wisdom — keep forging every ray to copper perfection')
  }

  return recs
}
