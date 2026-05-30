// ─── Interfaces ──────────────────────────────────────────

export interface SmeltingMeasure {
  strength: number
  metal:
    | 'phosphor-bronze'
    | 'bell-bronze'
    | 'proper-alloy'
    | 'weak-mix'
    | 'pure-copper'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasRobust: boolean
  hasNoFragile: boolean
  hasCombined: boolean
  hasNoSingleApproach: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasEnduring: boolean
  chaoticCount: number
  tangledCount: number
}

export interface AgingMeasure {
  wisdom: number
  patina:
    | 'noble-verdigris'
    | 'aged-bronze'
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
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasTimeless: boolean
  undocumentedCount: number
  experimentalCount: number
}

export interface KindlingMeasure {
  clarity: number
  dawn:
    | 'golden-dawn'
    | 'clear-morning'
    | 'proper-light'
    | 'foggy-forge'
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
  hasVisible: boolean
  hasPurpose: boolean
  hasFocused: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface HammeringMeasure {
  precision: number
  craft:
    | 'master-smith'
    | 'skilled-artisan'
    | 'proper-craft'
    | 'rough-work'
    | 'amateur-hour'
    | 'no-precision'
  hasHighPrecision: boolean
  hasAccurate: boolean
  hasNoWrong: boolean
  hasExact: boolean
  hasNoApproximate: boolean
  hasCorrect: boolean
  hasNoBuggy: boolean
  hasConsistent: boolean
  hasNoErratic: boolean
  hasValidated: boolean
  hasNoAssumed: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasErrorHandled: boolean
  hasRefined: boolean
  hasPolished: boolean
  wrongCount: number
  buggyCount: number
}

export interface FlowingMeasure {
  current: number
  flow:
    | 'eternal-river'
    | 'lasting-stream'
    | 'proper-current'
    | 'seasonal-creek'
    | 'dry-wash'
    | 'no-current'
  hasHighCurrent: boolean
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
  hasExtensible: boolean
  hasNoRigid: boolean
  hasFutureProof: boolean
  hasNoLegacy: boolean
  hasEnduring: boolean
  bareCrashCount: number
  fragileCount: number
}

export type IngotCondition =
  | 'bronze-masterpiece'
  | 'golden-alloy'
  | 'proper-metal'
  | 'tarnished-brass'
  | 'rusted-iron'
  | 'void'

export interface BronzeIngot {
  file: string
  alloyStrength: number
  patinaWisdom: number
  dawnClarity: number
  forgePrecision: number
  durableCurrent: number
  smelting: SmeltingMeasure
  aging: AgingMeasure
  kindling: KindlingMeasure
  hammering: HammeringMeasure
  flowing: FlowingMeasure
  condition: IngotCondition
  qualityScore: number
}

export type WorkshopType =
  | 'grand-forge'
  | 'bronze-foundry'
  | 'proper-forge'
  | 'small-anvil'
  | 'cold-hearth'
  | 'no-workshop'

export type WorkshopCondition =
  | 'ancient-foundry'
  | 'bronze-workshop'
  | 'proper-forge'
  | 'dying-ember'
  | 'cold-anvil'
  | 'void'

export interface BronzeWorkshop {
  directory: string
  ingots: BronzeIngot[]
  avgStrength: number
  avgPrecision: number
  avgCurrent: number
  bronzeMasterpieceCount: number
  voidCount: number
  workshopType: WorkshopType
  condition: WorkshopCondition
}

export type SmithGrade =
  | 'master-smith'
  | 'journeyman'
  | 'apprentice-smith'
  | 'bellows-boy'
  | 'novice'
  | 'scorched-fingers'

export interface BronzeForgeStats {
  totalFiles: number
  totalWorkshops: number
  avgAlloyStrength: number
  avgPatinaWisdom: number
  avgDawnClarity: number
  avgForgePrecision: number
  avgDurableCurrent: number
  bronzeMasterpieceCount: number
  goldenAlloyCount: number
  properMetalCount: number
  tarnishedBrassCount: number
  rustedIronCount: number
  voidCount: number
  hasHighStrengthCount: number
  hasHighWisdomCount: number
  hasHighClarityCount: number
  hasHighPrecisionCount: number
  hasHighCurrentCount: number
  overallCraft: number
  smithGrade: SmithGrade
  bestIngot: string
  strongest: string
  wisest: string
  clearest: string
  mostPrecise: string
  mostEnduring: string
}

export interface BronzeForgeResult {
  ingots: BronzeIngot[]
  workshops: BronzeWorkshop[]
  foundry: {
    avgStrength: number
    avgPrecision: number
    avgCurrent: number
    isBronze: boolean
    overallCraft: number
  }
  stats: BronzeForgeStats
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

/** @example measureSmelting('export class Analyzer<T> { }') */
export function measureSmelting(content: string): SmeltingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god-object)\b/i.test(content)
  const tangledCount = (content.match(/\bvar\b/g) ?? []).length
  const hasCleanPipelines = /\b(function|=>)\b/.test(content) || /\b(async|await)\b/.test(content)
  const hasNoTangled = tangledCount === 0
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasNoFragile = (content.match(/\bany\b/g) ?? []).length === 0
  const hasCombined = /\b(class|interface)\b/.test(content) && (/\b(function|=>|async)\b/.test(content))
  const hasNoSingleApproach = !/\b(single|only|just)\b/i.test(content)
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const hasNoUntested = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasCleanPipelines,
    hasRobust,
    hasCombined,
    hasTested,
    hasTypeSafe,
    hasEnduring,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60
  const metal = classifyMetal(strength)

  return {
    strength,
    metal,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasRobust,
    hasNoFragile,
    hasCombined,
    hasNoSingleApproach,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasEnduring,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureAging('export const LEGACY = true as const') */
export function measureAging(content: string): AgingMeasure {
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\bfunction\b/g) ?? []).length === 0 || hasDocumented
    ? 0
    : (content.match(/\bfunction\b/g) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const experimentalCount = (content.match(/\b(experimental|beta|alpha)\b/gi) ?? []).length
  const hasNoExperimental = experimentalCount === 0
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasEstablished = /\b(import|export|from)\b/.test(content)
  const hasNoNovel = !/\b(novel|untested)\b/i.test(content)
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content) || /\b(readonly|const)\b/.test(content)
  const hasNoAbandoned = !/\b(abandoned|forgotten|neglected)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const hasNoAdHoc = (content.match(/\bany\b/g) ?? []).length === 0
  const hasTimeless = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasDocumented,
    hasProven,
    hasMature,
    hasEstablished,
    hasStable,
    hasPrincipled,
    hasNoAdHoc,
    hasTimeless,
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
    hasPrincipled,
    hasNoAdHoc,
    hasTimeless,
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
  const hasNoCircuits = !/\b(circuitous|roundabout|indirect)\b/i.test(content)
  const hasVisible = /\b(export|public)\b/.test(content)
  const hasPurpose = /\b(function|class|interface)\b/.test(content)
  const hasFocused = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasReadable,
    hasSelfDocumenting,
    hasClear,
    hasTransparent,
    hasUnderstandable,
    hasDirect,
    hasVisible,
    hasFocused,
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
    hasVisible,
    hasPurpose,
    hasFocused,
    crypticCount,
    obfuscatedCount,
  }
}

/** @example measureHammering('export interface Config { readonly name: string }') */
export function measureHammering(content: string): HammeringMeasure {
  const hasAccurate = /\b(function|class|interface)\b/.test(content)
  const wrongCount = (content.match(/\b(wrong|incorrect)\b/gi) ?? []).length
  const hasNoWrong = wrongCount === 0
  const hasExact = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|close.enough)\b/i.test(content)
  const hasCorrect = /\b(return|yield|emit)\b/.test(content)
  const buggyCount = (content.match(/\b(buggy|broken|defective)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasConsistent = /\b(import|export|from)\b/.test(content)
  const hasNoErratic = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasValidated = /\b(try|catch|if)\b/.test(content)
  const hasNoAssumed = !/\b(assume|guess|hope)\b/i.test(content)
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoUnsafe = (content.match(/\bany\b/g) ?? []).length === 0
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasPolished = /\b(const|readonly|as const)\b/.test(content)

  const positiveBooleans = [
    hasAccurate,
    hasExact,
    hasCorrect,
    hasConsistent,
    hasValidated,
    hasTypeSafe,
    hasRefined,
    hasPolished,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const craft = classifyCraft(precision)

  return {
    precision,
    craft,
    hasHighPrecision,
    hasAccurate,
    hasNoWrong,
    hasExact,
    hasNoApproximate,
    hasCorrect,
    hasNoBuggy,
    hasConsistent,
    hasNoErratic,
    hasValidated,
    hasNoAssumed,
    hasTypeSafe,
    hasNoUnsafe,
    hasErrorHandled,
    hasRefined,
    hasPolished,
    wrongCount,
    buggyCount,
  }
}

/** @example measureFlowing('try { analyze() } catch { handleError() }') */
export function measureFlowing(content: string): FlowingMeasure {
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
  const fragileCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoFragile = fragileCount === 0
  const hasExtensible = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoRigid = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasFutureProof = /\b(readonly|as const)\b/.test(content)
  const hasNoLegacy = !/\b(legacy|deprecated|old)\b/i.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled,
    hasDefensive,
    hasGraceful,
    hasRecoverable,
    hasRobust,
    hasExtensible,
    hasFutureProof,
    hasEnduring,
  ]

  const current = computeScore(positiveBooleans)
  const hasHighCurrent = current >= 60
  const flow = classifyFlow(current)

  return {
    current,
    flow,
    hasHighCurrent,
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
    hasExtensible,
    hasNoRigid,
    hasFutureProof,
    hasNoLegacy,
    hasEnduring,
    bareCrashCount,
    fragileCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyMetal(score: number): SmeltingMeasure['metal'] {
  if (score >= 90) return 'phosphor-bronze'
  if (score >= 75) return 'bell-bronze'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'weak-mix'
  if (score >= 20) return 'pure-copper'
  return 'no-strength'
}

function classifyPatina(score: number): AgingMeasure['patina'] {
  if (score >= 90) return 'noble-verdigris'
  if (score >= 75) return 'aged-bronze'
  if (score >= 60) return 'proper-patina'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'raw-copper'
  return 'no-wisdom'
}

function classifyDawn(score: number): KindlingMeasure['dawn'] {
  if (score >= 90) return 'golden-dawn'
  if (score >= 75) return 'clear-morning'
  if (score >= 60) return 'proper-light'
  if (score >= 40) return 'foggy-forge'
  if (score >= 20) return 'dark-night'
  return 'no-clarity'
}

function classifyCraft(score: number): HammeringMeasure['craft'] {
  if (score >= 90) return 'master-smith'
  if (score >= 75) return 'skilled-artisan'
  if (score >= 60) return 'proper-craft'
  if (score >= 40) return 'rough-work'
  if (score >= 20) return 'amateur-hour'
  return 'no-precision'
}

function classifyFlow(score: number): FlowingMeasure['flow'] {
  if (score >= 90) return 'eternal-river'
  if (score >= 75) return 'lasting-stream'
  if (score >= 60) return 'proper-current'
  if (score >= 40) return 'seasonal-creek'
  if (score >= 20) return 'dry-wash'
  return 'no-current'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): IngotCondition {
  if (score >= 90) return 'bronze-masterpiece'
  if (score >= 75) return 'golden-alloy'
  if (score >= 60) return 'proper-metal'
  if (score >= 40) return 'tarnished-brass'
  if (score >= 20) return 'rusted-iron'
  return 'void'
}

/** @example classifyWorkshopType(ingots) */
export function classifyWorkshopType(ingots: BronzeIngot[]): WorkshopType {
  if (ingots.length === 0) return 'no-workshop'
  const avg = ingots.reduce((s, p) => s + p.qualityScore, 0) / ingots.length
  if (avg >= 90) return 'grand-forge'
  if (avg >= 75) return 'bronze-foundry'
  if (avg >= 60) return 'proper-forge'
  if (avg >= 40) return 'small-anvil'
  if (avg >= 20) return 'cold-hearth'
  return 'no-workshop'
}

/** @example classifyWorkshopCondition(avgStrength) */
export function classifyWorkshopCondition(avgStrength: number): WorkshopCondition {
  if (avgStrength >= 85) return 'ancient-foundry'
  if (avgStrength >= 70) return 'bronze-workshop'
  if (avgStrength >= 55) return 'proper-forge'
  if (avgStrength >= 35) return 'dying-ember'
  if (avgStrength >= 15) return 'cold-anvil'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgCraft: number): SmithGrade {
  if (avgCraft >= 80) return 'master-smith'
  if (avgCraft >= 65) return 'journeyman'
  if (avgCraft >= 50) return 'apprentice-smith'
  if (avgCraft >= 35) return 'bellows-boy'
  if (avgCraft >= 20) return 'novice'
  return 'scorched-fingers'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeBronzeIngot(content, 'app.ts') */
export function analyzeBronzeIngot(content: string, filePath: string): BronzeIngot {
  const smelting = measureSmelting(content)
  const aging = measureAging(content)
  const kindling = measureKindling(content)
  const hammering = measureHammering(content)
  const flowing = measureFlowing(content)

  const alloyStrength = smelting.strength
  const patinaWisdom = aging.wisdom
  const dawnClarity = kindling.clarity
  const forgePrecision = hammering.precision
  const durableCurrent = flowing.current

  const qualityScore = Math.round(
    alloyStrength * 0.2 +
    patinaWisdom * 0.2 +
    dawnClarity * 0.2 +
    forgePrecision * 0.2 +
    durableCurrent * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    alloyStrength,
    patinaWisdom,
    dawnClarity,
    forgePrecision,
    durableCurrent,
    smelting,
    aging,
    kindling,
    hammering,
    flowing,
    condition,
    qualityScore,
  }
}

/** @example analyzeBronzeWorkshop(ingots, 'src') */
export function analyzeBronzeWorkshop(ingots: BronzeIngot[], dirPath: string): BronzeWorkshop {
  if (ingots.length === 0) {
    return {
      directory: dirPath,
      ingots: [],
      avgStrength: 0,
      avgPrecision: 0,
      avgCurrent: 0,
      bronzeMasterpieceCount: 0,
      voidCount: 0,
      workshopType: 'no-workshop',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(
    ingots.reduce((s, p) => s + p.alloyStrength, 0) / ingots.length,
  )
  const avgPrecision = Math.round(
    ingots.reduce((s, p) => s + p.forgePrecision, 0) / ingots.length,
  )
  const avgCurrent = Math.round(
    ingots.reduce((s, p) => s + p.durableCurrent, 0) / ingots.length,
  )

  const bronzeMasterpieceCount = ingots.filter(
    (p) => p.condition === 'bronze-masterpiece',
  ).length
  const voidCount = ingots.filter((p) => p.condition === 'void').length

  const workshopType = classifyWorkshopType(ingots)
  const avgQuality = Math.round(
    ingots.reduce((s, p) => s + p.qualityScore, 0) / ingots.length,
  )
  const condition = classifyWorkshopCondition(avgQuality)

  return {
    directory: dirPath,
    ingots,
    avgStrength,
    avgPrecision,
    avgCurrent,
    bronzeMasterpieceCount,
    voidCount,
    workshopType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildBronzeForgeResult(['a.ts'], [content]) */
export async function buildBronzeForgeResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<BronzeForgeResult> {
  const ingots: BronzeIngot[] = files.map((file, i) =>
    analyzeBronzeIngot(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, BronzeIngot[]>()
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

  const workshops: BronzeWorkshop[] = Array.from(dirMap.entries()).map(([dir, dirIngots]) =>
    analyzeBronzeWorkshop(dirIngots, dir),
  )

  const avgStrength =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.alloyStrength, 0) / ingots.length)
      : 0
  const avgPrecision =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.forgePrecision, 0) / ingots.length)
      : 0
  const avgCurrent =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.durableCurrent, 0) / ingots.length)
      : 0

  const overallCraft =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.qualityScore, 0) / ingots.length)
      : 0
  const isBronze = overallCraft >= 60

  const foundry = { avgStrength, avgPrecision, avgCurrent, isBronze, overallCraft }

  const avgAlloyStrength = avgStrength
  const avgPatinaWisdom =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.patinaWisdom, 0) / ingots.length)
      : 0
  const avgDawnClarity =
    ingots.length > 0
      ? Math.round(ingots.reduce((s, p) => s + p.dawnClarity, 0) / ingots.length)
      : 0
  const avgForgePrecision = avgPrecision
  const avgDurableCurrent = avgCurrent

  const bronzeMasterpieceCount = ingots.filter(
    (p) => p.condition === 'bronze-masterpiece',
  ).length
  const goldenAlloyCount = ingots.filter((p) => p.condition === 'golden-alloy').length
  const properMetalCount = ingots.filter((p) => p.condition === 'proper-metal').length
  const tarnishedBrassCount = ingots.filter((p) => p.condition === 'tarnished-brass').length
  const rustedIronCount = ingots.filter((p) => p.condition === 'rusted-iron').length
  const voidCount = ingots.filter((p) => p.condition === 'void').length

  const hasHighStrengthCount = ingots.filter((p) => p.smelting.hasHighStrength).length
  const hasHighWisdomCount = ingots.filter((p) => p.aging.hasHighWisdom).length
  const hasHighClarityCount = ingots.filter((p) => p.kindling.hasHighClarity).length
  const hasHighPrecisionCount = ingots.filter((p) => p.hammering.hasHighPrecision).length
  const hasHighCurrentCount = ingots.filter((p) => p.flowing.hasHighCurrent).length

  const smithGrade = classifySmithGrade(overallCraft)

  const bestIngot = ingots.length > 0
    ? ingots.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const strongest = ingots.length > 0
    ? ingots.reduce((best, p) => (p.alloyStrength > best.alloyStrength ? p : best)).file
    : ''
  const wisest = ingots.length > 0
    ? ingots.reduce((best, p) => (p.patinaWisdom > best.patinaWisdom ? p : best)).file
    : ''
  const clearest = ingots.length > 0
    ? ingots.reduce((best, p) => (p.dawnClarity > best.dawnClarity ? p : best)).file
    : ''
  const mostPrecise = ingots.length > 0
    ? ingots.reduce((best, p) => (p.forgePrecision > best.forgePrecision ? p : best)).file
    : ''
  const mostEnduring = ingots.length > 0
    ? ingots.reduce((best, p) => (p.durableCurrent > best.durableCurrent ? p : best)).file
    : ''

  const stats: BronzeForgeStats = {
    totalFiles: files.length,
    totalWorkshops: workshops.length,
    avgAlloyStrength,
    avgPatinaWisdom,
    avgDawnClarity,
    avgForgePrecision,
    avgDurableCurrent,
    bronzeMasterpieceCount,
    goldenAlloyCount,
    properMetalCount,
    tarnishedBrassCount,
    rustedIronCount,
    voidCount,
    hasHighStrengthCount,
    hasHighWisdomCount,
    hasHighClarityCount,
    hasHighPrecisionCount,
    hasHighCurrentCount,
    overallCraft,
    smithGrade,
    bestIngot,
    strongest,
    wisest,
    clearest,
    mostPrecise,
    mostEnduring,
  }

  const recommendations = generateRecommendations(ingots, workshops, foundry, stats)

  return { ingots, workshops, foundry, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(ingots, workshops, foundry, stats) */
export function generateRecommendations(
  ingots: BronzeIngot[],
  workshops: BronzeWorkshop[],
  _foundry: BronzeForgeResult['foundry'],
  stats: BronzeForgeStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgAlloyStrength >= 90 &&
    stats.avgPatinaWisdom >= 90 &&
    stats.avgDawnClarity >= 90 &&
    stats.avgForgePrecision >= 90 &&
    stats.avgDurableCurrent >= 90
  ) {
    recs.push(
      'Your bronze forge produces masterwork alloy! Every ingot is a testament to ancient smithcraft perfection',
    )
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push(
      'Strengthen alloy composition — code must combine approaches like copper and tin to forge something stronger than either alone',
    )
  }

  if (stats.avgPatinaWisdom < 60) {
    recs.push(
      'Deepen patina wisdom — code should gain character with age, like verdigris on ancient bronze',
    )
  }

  if (stats.avgDawnClarity < 60) {
    recs.push(
      'Brighten dawn clarity — code should begin each cycle with clear purpose, like the forge at first light',
    )
  }

  if (stats.avgForgePrecision < 60) {
    recs.push(
      'Refine forge precision — code must be crafted with the smith attention to detail that separates masterwork from scrap',
    )
  }

  if (stats.avgDurableCurrent < 60) {
    recs.push(
      'Strengthen durable current — code should flow with lasting resilience, like bronze artifacts surviving millennia',
    )
  }

  if (stats.overallCraft < 40) {
    recs.push(
      'The forge grows cold — rebuild the bronze foundation before the fire dies completely',
    )
  }

  const voidIngots = ingots.filter((p) => p.condition === 'void')
  if (voidIngots.length > 0 && voidIngots.length <= 5) {
    recs.push(
      `Recast these rusted ingots: ${voidIngots.map((p) => p.file).join(', ')}`,
    )
  } else if (voidIngots.length > 5) {
    recs.push(
      `Recast these ${voidIngots.length} broken ingots before the entire foundry collapses`,
    )
  }

  const poorWorkshops = workshops.filter(
    (w) => w.condition === 'void' || w.condition === 'cold-anvil',
  )
  if (poorWorkshops.length === workshops.length && workshops.length > 0) {
    recs.push(
      'All workshops lie cold — consider rebuilding the entire forge from the ground up',
    )
  }

  if (recs.length === 0) {
    recs.push('Your bronze forge burns bright — keep hammering every ingot to masterwork precision')
  }

  return recs
}
