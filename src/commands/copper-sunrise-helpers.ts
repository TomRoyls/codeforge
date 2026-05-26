// ─── Interfaces ──────────────────────────────────────────

export interface RadiatingMeasure {
  warmth: number
  radiance: 'golden-dawn' | 'warm-glow' | 'proper-light' | 'dim-copper' | 'cold-metal' | 'no-warmth'
  hasHighWarmth: boolean
  hasApproachable: boolean
  hasNoHostile: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasInviting: boolean
  hasWelcoming: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasGentle: boolean
  hasPatient: boolean
  hasForgiving: boolean
  hasKind: boolean
  hasComfortable: boolean
  hasWarm: boolean
  hasGracious: boolean
  hostileCount: number
  crypticCount: number
}

export interface UnfoldingMeasure {
  patience: number
  dawn: 'patient-sunrise' | 'steady-dawn' | 'proper-morning' | 'hasty-dawn' | 'rushed-light' | 'no-patience'
  hasHighPatience: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasDocumented: boolean
  hasNoUndocumented: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasProven: boolean
  hasMature: boolean
  hasRefined: boolean
  hasDeliberate: boolean
  hasCareful: boolean
  hasThorough: boolean
  hasStable: boolean
  hasConsistent: boolean
  hasPatient: boolean
  undocumentedCount: number
  untestedCount: number
}

export interface ConductingMeasure {
  flow: number
  conductor: 'superconductor' | 'excellent-copper' | 'proper-wire' | 'resistive' | 'insulator' | 'no-flow'
  hasHighFlow: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasDirect: boolean
  hasClean: boolean
  hasOptimized: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasPrecise: boolean
  hasFast: boolean
  hasReliable: boolean
  hasAccurate: boolean
  hasLean: boolean
  hasFocused: boolean
  hasStreamlined: boolean
  hasNoRedundant: boolean
  wastefulCount: number
  unsafeCount: number
}

export interface IlluminatingMeasure {
  clarity: number
  forge: 'golden-anvil' | 'clear-forge' | 'proper-hearth' | 'smoky-fire' | 'dark-forge' | 'no-clarity'
  hasHighClarity: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasTransparent: boolean
  hasVisible: boolean
  hasDirect: boolean
  hasOrganized: boolean
  hasStructured: boolean
  hasReadable: boolean
  hasUnderstandable: boolean
  hasOpen: boolean
  hasRevealed: boolean
  hasIlluminated: boolean
  hasPurposeful: boolean
  obfuscatedCount: number
  mysteryCount: number
}

export interface AccumulatingMeasure {
  wisdom: number
  patina: 'ancient-green' | 'aged-bronze' | 'proper-patina' | 'tarnished' | 'raw-copper' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasEvolved: boolean
  hasExperienced: boolean
  hasReflective: boolean
  hasPatterned: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hasHistorical: boolean
  hackedCount: number
  naiveCount: number
}

export type RayCondition =
  | 'copper-masterpiece'
  | 'golden-morning'
  | 'proper-alloy'
  | 'tarnished-metal'
  | 'raw-ore'
  | 'void'

export interface CopperRay {
  file: string
  warmthRadiance: number
  dawnPatience: number
  conductiveFlow: number
  forgeClarity: number
  agedWisdom: number
  radiating: RadiatingMeasure
  unfolding: UnfoldingMeasure
  conducting: ConductingMeasure
  illuminating: IlluminatingMeasure
  accumulating: AccumulatingMeasure
  condition: RayCondition
  qualityScore: number
}

export type FoundryType =
  | 'grand-foundry'
  | 'copper-workshop'
  | 'proper-forge'
  | 'backyard-anvil'
  | 'no-forge'
  | 'no-foundry'

export type FoundryCondition =
  | 'copper-hall'
  | 'warm-workshop'
  | 'proper-forge'
  | 'cold-shed'
  | 'ruins'
  | 'void'

export interface CopperFoundry {
  directory: string
  rays: CopperRay[]
  avgWarmth: number
  avgFlow: number
  avgWisdom: number
  copperMasterpieceCount: number
  voidCount: number
  foundryType: FoundryType
  condition: FoundryCondition
}

export type SmithGrade = 'master-smith' | 'copper-forger' | 'proper-craftsman' | 'apprentice' | 'novice' | 'bellows-boy'

export interface CopperMorningResult {
  rays: CopperRay[]
  foundries: CopperFoundry[]
  dawn: {
    avgWarmth: number
    avgFlow: number
    avgWisdom: number
    isCopper: boolean
    overallRadiance: number
  }
  stats: {
    totalFiles: number
    totalFoundries: number
    avgWarmthRadiance: number
    avgDawnPatience: number
    avgConductiveFlow: number
    avgForgeClarity: number
    avgAgedWisdom: number
    copperMasterpieceCount: number
    goldenMorningCount: number
    properAlloyCount: number
    tarnishedMetalCount: number
    rawOreCount: number
    voidCount: number
    hasHighWarmthCount: number
    hasHighPatienceCount: number
    hasHighFlowCount: number
    hasHighClarityCount: number
    hasHighWisdomCount: number
    overallRadiance: number
    smithGrade: SmithGrade
    bestRay: string
    warmest: string
    mostPatient: string
    mostConductive: string
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

/** @example classifyRayCondition(90) */
export function classifyRayCondition(score: number): RayCondition {
  if (score >= 90) return 'copper-masterpiece'
  if (score >= 75) return 'golden-morning'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifyFoundryType(rays) */
export function classifyFoundryType(rays: CopperRay[]): FoundryType {
  if (rays.length === 0) return 'no-foundry'
  const avg = rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length
  if (avg >= 85) return 'grand-foundry'
  if (avg >= 70) return 'copper-workshop'
  if (avg >= 55) return 'proper-forge'
  if (avg >= 35) return 'backyard-anvil'
  return 'no-forge'
}

/** @example classifyFoundryCondition(85) */
export function classifyFoundryCondition(score: number): FoundryCondition {
  if (score >= 85) return 'copper-hall'
  if (score >= 70) return 'warm-workshop'
  if (score >= 55) return 'proper-forge'
  if (score >= 35) return 'cold-shed'
  if (score >= 15) return 'ruins'
  return 'void'
}

/** @example classifySmithGrade(80) */
export function classifySmithGrade(avgRadiance: number): SmithGrade {
  if (avgRadiance >= 80) return 'master-smith'
  if (avgRadiance >= 65) return 'copper-forger'
  if (avgRadiance >= 50) return 'proper-craftsman'
  if (avgRadiance >= 35) return 'apprentice'
  if (avgRadiance >= 20) return 'novice'
  return 'bellows-boy'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRadiating('class X { readonly y: string }') */
export function measureRadiating(content: string): RadiatingMeasure {
  const hasApproachable = /\b(class|interface|type)\b/.test(content)
  const hostileCount = (content.match(/\b(hostile|aggressive|dangerous|violent)\b/gi) ?? []).length
  const hasNoHostile = hostileCount === 0
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasInviting = /\b(import|export)\b/.test(content)
  const hasWelcoming = /\b(async|await|Promise)\b/.test(content)
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const hasNoUnhandled = (content.match(/\b(unhandled|unchecked|bare)\b/gi) ?? []).length === 0
  const hasGentle = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasPatient = /\b(readonly|private|protected)\b/.test(content)
  const hasForgiving = !/\bany\b/.test(content)
  const hasKind = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasComfortable = /\b(function|=>|return)\b/.test(content)
  const hasWarm = /\b(const|readonly)\b/.test(content)
  const hasGracious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasInviting,
    hasWelcoming, hasErrorHandled, hasNoUnhandled, hasGentle, hasPatient,
    hasForgiving, hasKind, hasComfortable, hasWarm, hasGracious,
  ]

  const warmth = computeScore(positiveBooleans)
  const hasHighWarmth = warmth >= 60

  let radiance: RadiatingMeasure['radiance'] = 'no-warmth'
  if (warmth >= 90) radiance = 'golden-dawn'
  else if (warmth >= 75) radiance = 'warm-glow'
  else if (warmth >= 60) radiance = 'proper-light'
  else if (warmth >= 40) radiance = 'dim-copper'
  else if (warmth >= 20) radiance = 'cold-metal'

  return {
    warmth, radiance, hasHighWarmth,
    hasApproachable, hasNoHostile, hasReadable, hasNoCryptic, hasInviting,
    hasWelcoming, hasErrorHandled, hasNoUnhandled, hasGentle, hasPatient,
    hasForgiving, hasKind, hasComfortable, hasWarm, hasGracious,
    hostileCount, crypticCount,
  }
}

/** @example measureUnfolding('try { x } catch { y }') */
export function measureUnfolding(content: string): UnfoldingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const hasNoChaotic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = (content.match(/\b(undocumented|undocumented|orphan)\b/gi) ?? []).length
  const hasNoUndocumented = undocumentedCount === 0
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasProven = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasRefined = !/\bany\b/.test(content)
  const hasDeliberate = /\b(import|export)\b/.test(content)
  const hasCareful = /\b(const|readonly)\b/.test(content)
  const hasThorough = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasStable = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasConsistent = /\b(async|await|Promise)\b/.test(content)
  const hasPatient = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasDocumented, hasNoUndocumented, hasTested,
    hasNoUntested, hasProven, hasMature, hasRefined, hasDeliberate,
    hasCareful, hasThorough, hasStable, hasConsistent, hasPatient,
  ]

  const patience = computeScore(positiveBooleans)
  const hasHighPatience = patience >= 60

  let dawn: UnfoldingMeasure['dawn'] = 'no-patience'
  if (patience >= 90) dawn = 'patient-sunrise'
  else if (patience >= 75) dawn = 'steady-dawn'
  else if (patience >= 60) dawn = 'proper-morning'
  else if (patience >= 40) dawn = 'hasty-dawn'
  else if (patience >= 20) dawn = 'rushed-light'

  return {
    patience, dawn, hasHighPatience,
    hasWellStructured, hasNoChaotic, hasDocumented, hasNoUndocumented, hasTested,
    hasNoUntested, hasProven, hasMature, hasRefined, hasDeliberate,
    hasCareful, hasThorough, hasStable, hasConsistent, hasPatient,
    undocumentedCount, untestedCount,
  }
}

/** @example measureConducting('const x: string = "ok"') */
export function measureConducting(content: string): ConductingMeasure {
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const wastefulCount = (content.match(/\b(wasteful|bloated|redundant)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasOptimized = /\b(async|await|Promise)\b/.test(content)
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|any)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasPrecise = !/\bany\b/.test(content)
  const hasFast = /\b(import|export)\b/.test(content)
  const hasReliable = /\b(class|interface|type)\b/.test(content)
  const hasAccurate = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasFocused = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStreamlined = /\b(readonly|private|protected)\b/.test(content)
  const hasNoRedundant = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasEfficient, hasNoWasteful, hasDirect, hasClean, hasOptimized,
    hasTypeSafe, hasNoUnsafe, hasPrecise, hasFast, hasReliable,
    hasAccurate, hasLean, hasFocused, hasStreamlined, hasNoRedundant,
  ]

  const flow = computeScore(positiveBooleans)
  const hasHighFlow = flow >= 60

  let conductor: ConductingMeasure['conductor'] = 'no-flow'
  if (flow >= 90) conductor = 'superconductor'
  else if (flow >= 75) conductor = 'excellent-copper'
  else if (flow >= 60) conductor = 'proper-wire'
  else if (flow >= 40) conductor = 'resistive'
  else if (flow >= 20) conductor = 'insulator'

  return {
    flow, conductor, hasHighFlow,
    hasEfficient, hasNoWasteful, hasDirect, hasClean, hasOptimized,
    hasTypeSafe, hasNoUnsafe, hasPrecise, hasFast, hasReliable,
    hasAccurate, hasLean, hasFocused, hasStreamlined, hasNoRedundant,
    wastefulCount, unsafeCount,
  }
}

/** @example measureIlluminating('export class X { readonly y: string }') */
export function measureIlluminating(content: string): IlluminatingMeasure {
  const hasClear = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(obfuscate|minified|cryptic)\b/gi) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const mysteryCount = (content.match(/\b(global|window|document)\b/g) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasTransparent = /\b(import|export)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasOrganized = /\b(class|interface|type)\b/.test(content)
  const hasStructured = /\b(async|await|Promise)\b/.test(content)
  const hasReadable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnderstandable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasRevealed = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasIlluminated = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPurposeful = /\b(try|catch|if)\b/.test(content)

  const positiveBooleans = [
    hasClear, hasNoObfuscated, hasSelfDocumenting, hasNoMystery, hasTransparent,
    hasVisible, hasDirect, hasOrganized, hasStructured, hasReadable,
    hasUnderstandable, hasOpen, hasRevealed, hasIlluminated, hasPurposeful,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let forge: IlluminatingMeasure['forge'] = 'no-clarity'
  if (clarity >= 90) forge = 'golden-anvil'
  else if (clarity >= 75) forge = 'clear-forge'
  else if (clarity >= 60) forge = 'proper-hearth'
  else if (clarity >= 40) forge = 'smoky-fire'
  else if (clarity >= 20) forge = 'dark-forge'

  return {
    clarity, forge, hasHighClarity,
    hasClear, hasNoObfuscated, hasSelfDocumenting, hasNoMystery, hasTransparent,
    hasVisible, hasDirect, hasOrganized, hasStructured, hasReadable,
    hasUnderstandable, hasOpen, hasRevealed, hasIlluminated, hasPurposeful,
    obfuscatedCount, mysteryCount,
  }
}

/** @example measureAccumulating('export class X { readonly y: string }') */
export function measureAccumulating(content: string): AccumulatingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasEvolved = /\b(async|await|Promise)\b/.test(content)
  const hasExperienced = /\b(import|export)\b/.test(content)
  const hasReflective = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPatterned = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrategic = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasInsightful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasWise = /\b(function|=>|return)\b/.test(content)
  const hasAccumulated = /\b(const|readonly)\b/.test(content)
  const hasHistorical = (content.match(/\b(naive|simple|basic|trivial)\b/gi) ?? []).length === 0
  const naiveCount = (content.match(/\b(naive|simple|basic|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasEvolved, hasExperienced, hasReflective, hasPatterned,
    hasStrategic, hasInsightful, hasWise, hasAccumulated, hasHistorical,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let patina: AccumulatingMeasure['patina'] = 'no-wisdom'
  if (wisdom >= 90) patina = 'ancient-green'
  else if (wisdom >= 75) patina = 'aged-bronze'
  else if (wisdom >= 60) patina = 'proper-patina'
  else if (wisdom >= 40) patina = 'tarnished'
  else if (wisdom >= 20) patina = 'raw-copper'

  return {
    wisdom, patina, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasEvolved, hasExperienced, hasReflective, hasPatterned,
    hasStrategic, hasInsightful, hasWise, hasAccumulated, hasHistorical,
    hackedCount, naiveCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCopperRay(content, 'app.ts') */
export function analyzeCopperRay(content: string, filePath: string): CopperRay {
  const radiating = measureRadiating(content)
  const unfolding = measureUnfolding(content)
  const conducting = measureConducting(content)
  const illuminating = measureIlluminating(content)
  const accumulating = measureAccumulating(content)

  const warmthRadiance = radiating.warmth
  const dawnPatience = unfolding.patience
  const conductiveFlow = conducting.flow
  const forgeClarity = illuminating.clarity
  const agedWisdom = accumulating.wisdom

  const qualityScore = Math.round(
    warmthRadiance * 0.2 +
    dawnPatience * 0.2 +
    conductiveFlow * 0.2 +
    forgeClarity * 0.2 +
    agedWisdom * 0.2,
  )

  const condition = classifyRayCondition(qualityScore)

  return {
    file: filePath,
    warmthRadiance, dawnPatience, conductiveFlow, forgeClarity, agedWisdom,
    radiating, unfolding, conducting, illuminating, accumulating,
    condition, qualityScore,
  }
}

/** @example analyzeCopperFoundry(rays, 'src') */
export function analyzeCopperFoundry(rays: CopperRay[], dirPath: string): CopperFoundry {
  if (rays.length === 0) {
    return {
      directory: dirPath, rays: [],
      avgWarmth: 0, avgFlow: 0, avgWisdom: 0,
      copperMasterpieceCount: 0, voidCount: 0,
      foundryType: 'no-foundry', condition: 'void',
    }
  }

  const avgWarmth = Math.round(rays.reduce((s, r) => s + r.warmthRadiance, 0) / rays.length)
  const avgFlow = Math.round(rays.reduce((s, r) => s + r.conductiveFlow, 0) / rays.length)
  const avgWisdom = Math.round(rays.reduce((s, r) => s + r.agedWisdom, 0) / rays.length)
  const copperMasterpieceCount = rays.filter((r) => r.condition === 'copper-masterpiece').length
  const voidCount = rays.filter((r) => r.condition === 'void').length
  const foundryType = classifyFoundryType(rays)
  const avgQuality = Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length)
  const condition = classifyFoundryCondition(avgQuality)

  return {
    directory: dirPath, rays,
    avgWarmth, avgFlow, avgWisdom,
    copperMasterpieceCount, voidCount,
    foundryType, condition,
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

  const foundries: CopperFoundry[] = Array.from(dirMap.entries()).map(([dir, dirRays]) =>
    analyzeCopperFoundry(dirRays, dir),
  )

  const avgWarmthRadiance = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.warmthRadiance, 0) / rays.length) : 0
  const avgDawnPatience = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.dawnPatience, 0) / rays.length) : 0
  const avgConductiveFlow = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.conductiveFlow, 0) / rays.length) : 0
  const avgForgeClarity = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.forgeClarity, 0) / rays.length) : 0
  const avgAgedWisdom = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.agedWisdom, 0) / rays.length) : 0

  const overallRadiance = rays.length > 0
    ? Math.round(rays.reduce((s, r) => s + r.qualityScore, 0) / rays.length) : 0
  const isCopper = overallRadiance >= 60

  const dawn = { avgWarmth: avgWarmthRadiance, avgFlow: avgConductiveFlow, avgWisdom: avgAgedWisdom, isCopper, overallRadiance }

  const copperMasterpieceCount = rays.filter((r) => r.condition === 'copper-masterpiece').length
  const goldenMorningCount = rays.filter((r) => r.condition === 'golden-morning').length
  const properAlloyCount = rays.filter((r) => r.condition === 'proper-alloy').length
  const tarnishedMetalCount = rays.filter((r) => r.condition === 'tarnished-metal').length
  const rawOreCount = rays.filter((r) => r.condition === 'raw-ore').length
  const voidCount = rays.filter((r) => r.condition === 'void').length

  const hasHighWarmthCount = rays.filter((r) => r.radiating.hasHighWarmth).length
  const hasHighPatienceCount = rays.filter((r) => r.unfolding.hasHighPatience).length
  const hasHighFlowCount = rays.filter((r) => r.conducting.hasHighFlow).length
  const hasHighClarityCount = rays.filter((r) => r.illuminating.hasHighClarity).length
  const hasHighWisdomCount = rays.filter((r) => r.accumulating.hasHighWisdom).length

  const smithGrade = classifySmithGrade(overallRadiance)

  const bestRay = rays.length > 0
    ? rays.reduce((best, r) => (r.qualityScore > best.qualityScore ? r : best)).file : ''
  const warmest = rays.length > 0
    ? rays.reduce((best, r) => (r.warmthRadiance > best.warmthRadiance ? r : best)).file : ''
  const mostPatient = rays.length > 0
    ? rays.reduce((best, r) => (r.dawnPatience > best.dawnPatience ? r : best)).file : ''
  const mostConductive = rays.length > 0
    ? rays.reduce((best, r) => (r.conductiveFlow > best.conductiveFlow ? r : best)).file : ''
  const clearest = rays.length > 0
    ? rays.reduce((best, r) => (r.forgeClarity > best.forgeClarity ? r : best)).file : ''
  const wisest = rays.length > 0
    ? rays.reduce((best, r) => (r.agedWisdom > best.agedWisdom ? r : best)).file : ''

  const stats: CopperMorningResult['stats'] = {
    totalFiles: files.length, totalFoundries: foundries.length,
    avgWarmthRadiance, avgDawnPatience, avgConductiveFlow, avgForgeClarity, avgAgedWisdom,
    copperMasterpieceCount, goldenMorningCount, properAlloyCount, tarnishedMetalCount, rawOreCount, voidCount,
    hasHighWarmthCount, hasHighPatienceCount, hasHighFlowCount, hasHighClarityCount, hasHighWisdomCount,
    overallRadiance, smithGrade,
    bestRay, warmest, mostPatient, mostConductive, clearest, wisest,
  }

  const recommendations = generateRecommendations(rays, foundries, dawn, stats)

  return { rays, foundries, dawn, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(rays, foundries, dawn, stats) */
export function generateRecommendations(
  rays: CopperRay[],
  foundries: CopperFoundry[],
  dawn: CopperMorningResult['dawn'],
  stats: CopperMorningResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgWarmthRadiance >= 90 &&
    stats.avgDawnPatience >= 90 &&
    stats.avgConductiveFlow >= 90 &&
    stats.avgForgeClarity >= 90 &&
    stats.avgAgedWisdom >= 90
  ) {
    recs.push(
      'Your copper morning is a masterpiece of warm radiance! Every ray glows with approachable warmth, patient dawn, efficient conductivity, clear forge-light, and ancient copper wisdom!',
    )
    return recs
  }

  if (stats.avgWarmthRadiance < 60) {
    recs.push(
      'Warm the copper surface — your code needs more approachable structure, error handling, and forgiving design to radiate warmth',
    )
  }

  if (stats.avgDawnPatience < 60) {
    recs.push(
      'Let the dawn unfold patiently — morning light arrives on its own schedule; your code needs better documentation, proven patterns, and unhurried structure',
    )
  }

  if (stats.avgConductiveFlow < 60) {
    recs.push(
      'Improve the conductive flow — copper is the standard for conductivity; your code needs type safety, efficient patterns, and lean abstractions',
    )
  }

  if (stats.avgForgeClarity < 60) {
    recs.push(
      'Clear the forge smoke — morning light on copper reveals every detail; your code needs transparent naming, clear organization, and self-documenting types',
    )
  }

  if (stats.avgAgedWisdom < 60) {
    recs.push(
      'Let the patina deepen — copper wisdom accumulates over seasons; your code should be well-architected, principled, and built on proven patterns',
    )
  }

  if (stats.overallRadiance < 40) {
    recs.push(
      'The copper morning has faded to darkness — no warmth reaches the surface and the forge has gone cold',
    )
  }

  const voidRays = rays.filter((r) => r.condition === 'void')
  if (voidRays.length > 0 && voidRays.length <= 5) {
    recs.push(`Polish these raw ores: ${voidRays.map((r) => r.file).join(', ')}`)
  } else if (voidRays.length > 5) {
    recs.push(`Polish ${voidRays.length} raw ores before the entire foundry rusts away`)
  }

  const poorFoundries = foundries.filter((f) => f.condition === 'void' || f.condition === 'ruins')
  if (poorFoundries.length === foundries.length && foundries.length > 0) {
    recs.push('All foundries have collapsed — the copper morning needs complete reconstruction from raw ore to finished work')
  }

  if (recs.length === 0) {
    recs.push('Your copper morning radiates well — each ray combines warmth, patience, conductivity, clarity, and aged wisdom')
  }

  return recs
}
