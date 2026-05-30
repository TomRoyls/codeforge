// ─── Interfaces ──────────────────────────────────────────

export interface RevealingMeasure {
  clarity: number
  volcanic: 'perfect-mirror' | 'polished-obsidian' | 'proper-glass' | 'rough-lava' | 'molten-chaos' | 'no-clarity'
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
  hasIlluminated: boolean
  hasOpen: boolean
  hasExpressive: boolean
  hasHonest: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface EnduringMeasure {
  resilience: number
  shadow: 'volcanic-strength' | 'dark-fortress' | 'proper-shade' | 'thin-veil' | 'crumbling-rock' | 'no-resilience'
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
  hasFortified: boolean
  hasUnshakable: boolean
  hasUnyielding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface ReflectingMeasure {
  depth: number
  mirror: 'scrying-mirror' | 'dark-pool' | 'proper-reflection' | 'distorted-surface' | 'cracked-glass' | 'no-depth'
  hasHighDepth: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasSelfAware: boolean
  hasIntrospective: boolean
  hasDocumented: boolean
  hasOrganized: boolean
  hasCoherent: boolean
  hasConsistent: boolean
  hasUnified: boolean
  hasClean: boolean
  hasModular: boolean
  hasMaintainable: boolean
  hasRefactorable: boolean
  hasHarmonious: boolean
  hasSelfContained: boolean
  chaoticCount: number
  undocumentedCount: number
}

export interface CuttingMeasure {
  precision: number
  blade: 'surgeon-scalpel' | 'razor-edge' | 'proper-blade' | 'dull-knife' | 'blunt-force' | 'no-precision'
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
  hasTargeted: boolean
  hasSurgical: boolean
  hasCalibrated: boolean
  unsafeCount: number
  approximateCount: number
}

export interface KnowingMeasure {
  wisdom: number
  shadow: 'shadow-sage' | 'twilight-knower' | 'proper-lurker' | 'surface-dweller' | 'blind-walker' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasMature: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasExperienced: boolean
  hasReflective: boolean
  hasEvolved: boolean
  hasAdaptive: boolean
  hasAware: boolean
  hasKnowledgeable: boolean
  hasAccumulated: boolean
  hackedCount: number
  naiveCount: number
}

export type ObsidianCondition =
  | 'obsidian-masterpiece'
  | 'volcanic-perfection'
  | 'proper-blade'
  | 'dull-glass'
  | 'shattered-rock'
  | 'void'

export interface ObsidianBlock {
  file: string
  volcanicClarity: number
  darkResilience: number
  mirrorDepth: number
  bladePrecision: number
  shadowWisdom: number
  revealing: RevealingMeasure
  enduring: EnduringMeasure
  reflecting: ReflectingMeasure
  cutting: CuttingMeasure
  knowing: KnowingMeasure
  condition: ObsidianCondition
  qualityScore: number
}

export type ShrineType =
  | 'sacred-temple'
  | 'volcanic-shrine'
  | 'proper-altar'
  | 'stone-table'
  | 'empty-pedestal'
  | 'no-shrine'

export type ShrineCondition =
  | 'obsidian-cathedral'
  | 'dark-sanctuary'
  | 'proper-temple'
  | 'ruined-shrine'
  | 'rubble'
  | 'void'

export interface ObsidianShrine {
  directory: string
  blocks: ObsidianBlock[]
  avgClarity: number
  avgPrecision: number
  avgWisdom: number
  obsidianMasterpieceCount: number
  voidCount: number
  shrineType: ShrineType
  condition: ShrineCondition
}

export type PriestGrade = 'high-priest' | 'temple-guardian' | 'proper-artisan' | 'apprentice' | 'novice' | 'stone-breaker'

export interface ObsidianTempleResult {
  blocks: ObsidianBlock[]
  shrines: ObsidianShrine[]
  volcano: {
    avgClarity: number
    avgPrecision: number
    avgWisdom: number
    isObsidian: boolean
    overallSharpness: number
  }
  stats: {
    totalFiles: number
    totalShrines: number
    avgVolcanicClarity: number
    avgDarkResilience: number
    avgMirrorDepth: number
    avgBladePrecision: number
    avgShadowWisdom: number
    obsidianMasterpieceCount: number
    volcanicPerfectionCount: number
    properBladeCount: number
    dullGlassCount: number
    shatteredRockCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighResilienceCount: number
    hasHighDepthCount: number
    hasHighPrecisionCount: number
    hasHighWisdomCount: number
    overallSharpness: number
    priestGrade: PriestGrade
    bestBlock: string
    clearest: string
    mostResilient: string
    deepest: string
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

/** @example classifyObsidianCondition(90) */
export function classifyObsidianCondition(score: number): ObsidianCondition {
  if (score >= 90) return 'obsidian-masterpiece'
  if (score >= 75) return 'volcanic-perfection'
  if (score >= 60) return 'proper-blade'
  if (score >= 40) return 'dull-glass'
  if (score >= 20) return 'shattered-rock'
  return 'void'
}

/** @example classifyShrineType(blocks) */
export function classifyShrineType(blocks: ObsidianBlock[]): ShrineType {
  if (blocks.length === 0) return 'no-shrine'
  const avg = blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length
  if (avg >= 85) return 'sacred-temple'
  if (avg >= 70) return 'volcanic-shrine'
  if (avg >= 55) return 'proper-altar'
  if (avg >= 35) return 'stone-table'
  return 'empty-pedestal'
}

/** @example classifyShrineCondition(85) */
export function classifyShrineCondition(score: number): ShrineCondition {
  if (score >= 85) return 'obsidian-cathedral'
  if (score >= 70) return 'dark-sanctuary'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'ruined-shrine'
  if (score >= 15) return 'rubble'
  return 'void'
}

/** @example classifyPriestGrade(80) */
export function classifyPriestGrade(avgSharpness: number): PriestGrade {
  if (avgSharpness >= 80) return 'high-priest'
  if (avgSharpness >= 65) return 'temple-guardian'
  if (avgSharpness >= 50) return 'proper-artisan'
  if (avgSharpness >= 35) return 'apprentice'
  if (avgSharpness >= 20) return 'novice'
  return 'stone-breaker'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureRevealing('class X { readonly y: string }') */
export function measureRevealing(content: string): RevealingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasTransparent = /\b(import|export)\b/.test(content)
  const hasUnderstandable = /\b(async|await|Promise)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasRevealed = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasIlluminated = /\b(try|catch|if)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasExpressive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHonest = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasRevealed, hasIlluminated, hasOpen, hasExpressive, hasHonest,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let volcanic: RevealingMeasure['volcanic'] = 'no-clarity'
  if (clarity >= 90) volcanic = 'perfect-mirror'
  else if (clarity >= 75) volcanic = 'polished-obsidian'
  else if (clarity >= 60) volcanic = 'proper-glass'
  else if (clarity >= 40) volcanic = 'rough-lava'
  else if (clarity >= 20) volcanic = 'molten-chaos'

  return {
    clarity, volcanic, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasTransparent, hasUnderstandable, hasVisible, hasDirect,
    hasRevealed, hasIlluminated, hasOpen, hasExpressive, hasHonest,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureEnduring('try { x } catch { y }') */
export function measureEnduring(content: string): EnduringMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasEnduring = /\b(class|interface|type)\b/.test(content)
  const hasSolid = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasReinforced = /\b(import|export)\b/.test(content)
  const hasImpervious = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasFortified = /\b(async|await|Promise)\b/.test(content)
  const hasUnshakable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasUnyielding = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasSolid,
    hasReinforced, hasImpervious, hasFortified, hasUnshakable, hasUnyielding,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let shadow: EnduringMeasure['shadow'] = 'no-resilience'
  if (resilience >= 90) shadow = 'volcanic-strength'
  else if (resilience >= 75) shadow = 'dark-fortress'
  else if (resilience >= 60) shadow = 'proper-shade'
  else if (resilience >= 40) shadow = 'thin-veil'
  else if (resilience >= 20) shadow = 'crumbling-rock'

  return {
    resilience, shadow, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasStable, hasHardened, hasEnduring, hasSolid,
    hasReinforced, hasImpervious, hasFortified, hasUnshakable, hasUnyielding,
    unhandledCount, untestedCount,
  }
}

/** @example measureReflecting('export class X { readonly y: string }') */
export function measureReflecting(content: string): ReflectingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasSelfAware = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasIntrospective = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasCoherent = !/\bany\b/.test(content)
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)
  const hasUnified = /\b(const|readonly)\b/.test(content)
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasModular = /\b(import|export)\b/.test(content)
  const hasMaintainable = /\b(function|=>|return)\b/.test(content)
  const hasRefactorable = /\b(async|await|Promise)\b/.test(content)
  const hasHarmonious = /\b(try|catch|if)\b/.test(content)
  const hasSelfContained = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const undocumentedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasSelfAware, hasIntrospective, hasDocumented,
    hasOrganized, hasCoherent, hasConsistent, hasUnified, hasClean,
    hasModular, hasMaintainable, hasRefactorable, hasHarmonious, hasSelfContained,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60

  let mirror: ReflectingMeasure['mirror'] = 'no-depth'
  if (depth >= 90) mirror = 'scrying-mirror'
  else if (depth >= 75) mirror = 'dark-pool'
  else if (depth >= 60) mirror = 'proper-reflection'
  else if (depth >= 40) mirror = 'distorted-surface'
  else if (depth >= 20) mirror = 'cracked-glass'

  return {
    depth, mirror, hasHighDepth,
    hasWellStructured, hasNoChaotic, hasSelfAware, hasIntrospective, hasDocumented,
    hasOrganized, hasCoherent, hasConsistent, hasUnified, hasClean,
    hasModular, hasMaintainable, hasRefactorable, hasHarmonious, hasSelfContained,
    chaoticCount, undocumentedCount,
  }
}

/** @example measureCutting('const x: string = "ok"') */
export function measureCutting(content: string): CuttingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\b(unsafe|any)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = !/\bany\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|guess|hack)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasCorrect = /\b(const|readonly)\b/.test(content)
  const hasFaithful = /\b(import|export)\b/.test(content)
  const hasSharp = /\b(function|=>|return)\b/.test(content)
  const hasCrisp = /\b(try|catch|if)\b/.test(content)
  const hasDefined = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasTargeted = /\b(async|await|Promise)\b/.test(content)
  const hasSurgical = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasCalibrated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasFaithful, hasSharp,
    hasCrisp, hasDefined, hasTargeted, hasSurgical, hasCalibrated,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let blade: CuttingMeasure['blade'] = 'no-precision'
  if (precision >= 90) blade = 'surgeon-scalpel'
  else if (precision >= 75) blade = 'razor-edge'
  else if (precision >= 60) blade = 'proper-blade'
  else if (precision >= 40) blade = 'dull-knife'
  else if (precision >= 20) blade = 'blunt-force'

  return {
    precision, blade, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasCorrect, hasFaithful, hasSharp,
    hasCrisp, hasDefined, hasTargeted, hasSurgical, hasCalibrated,
    unsafeCount, approximateCount,
  }
}

/** @example measureKnowing('export class X { readonly y: string }') */
export function measureKnowing(content: string): KnowingMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasExperienced = /\b(async|await|Promise)\b/.test(content)
  const hasReflective = /\b(function|=>|return)\b/.test(content)
  const hasEvolved = /\b(const|readonly)\b/.test(content)
  const hasAdaptive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasAware = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasKnowledgeable = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = /\b(throw|return)\b/.test(content)
  const naiveCount = (content.match(/\b(naive|simple|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasExperienced, hasReflective,
    hasEvolved, hasAdaptive, hasAware, hasKnowledgeable, hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let shadow: KnowingMeasure['shadow'] = 'no-wisdom'
  if (wisdom >= 90) shadow = 'shadow-sage'
  else if (wisdom >= 75) shadow = 'twilight-knower'
  else if (wisdom >= 60) shadow = 'proper-lurker'
  else if (wisdom >= 40) shadow = 'surface-dweller'
  else if (wisdom >= 20) shadow = 'blind-walker'

  return {
    wisdom, shadow, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasMature, hasStrategic, hasInsightful, hasExperienced, hasReflective,
    hasEvolved, hasAdaptive, hasAware, hasKnowledgeable, hasAccumulated,
    hackedCount, naiveCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeObsidianBlock(content, 'app.ts') */
export function analyzeObsidianBlock(content: string, filePath: string): ObsidianBlock {
  const revealing = measureRevealing(content)
  const enduring = measureEnduring(content)
  const reflecting = measureReflecting(content)
  const cutting = measureCutting(content)
  const knowing = measureKnowing(content)

  const volcanicClarity = revealing.clarity
  const darkResilience = enduring.resilience
  const mirrorDepth = reflecting.depth
  const bladePrecision = cutting.precision
  const shadowWisdom = knowing.wisdom

  const qualityScore = Math.round(
    volcanicClarity * 0.2 +
    darkResilience * 0.2 +
    mirrorDepth * 0.2 +
    bladePrecision * 0.2 +
    shadowWisdom * 0.2,
  )

  const condition = classifyObsidianCondition(qualityScore)

  return {
    file: filePath,
    volcanicClarity, darkResilience, mirrorDepth, bladePrecision, shadowWisdom,
    revealing, enduring, reflecting, cutting, knowing,
    condition, qualityScore,
  }
}

/** @example analyzeObsidianShrine(blocks, 'src') */
export function analyzeObsidianShrine(blocks: ObsidianBlock[], dirPath: string): ObsidianShrine {
  if (blocks.length === 0) {
    return {
      directory: dirPath, blocks: [],
      avgClarity: 0, avgPrecision: 0, avgWisdom: 0,
      obsidianMasterpieceCount: 0, voidCount: 0,
      shrineType: 'no-shrine', condition: 'void',
    }
  }

  const avgClarity = Math.round(blocks.reduce((s, b) => s + b.volcanicClarity, 0) / blocks.length)
  const avgPrecision = Math.round(blocks.reduce((s, b) => s + b.bladePrecision, 0) / blocks.length)
  const avgWisdom = Math.round(blocks.reduce((s, b) => s + b.shadowWisdom, 0) / blocks.length)
  const obsidianMasterpieceCount = blocks.filter((b) => b.condition === 'obsidian-masterpiece').length
  const voidCount = blocks.filter((b) => b.condition === 'void').length
  const shrineType = classifyShrineType(blocks)
  const avgQuality = Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length)
  const condition = classifyShrineCondition(avgQuality)

  return {
    directory: dirPath, blocks,
    avgClarity, avgPrecision, avgWisdom,
    obsidianMasterpieceCount, voidCount,
    shrineType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildObsidianTempleResult(['a.ts'], [content]) */
export async function buildObsidianTempleResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<ObsidianTempleResult> {
  const blocks: ObsidianBlock[] = files.map((file, i) =>
    analyzeObsidianBlock(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, ObsidianBlock[]>()
  for (const block of blocks) {
    const dir = block.file.includes('/')
      ? block.file.substring(0, block.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(block)
    } else {
      dirMap.set(dir, [block])
    }
  }

  const shrines: ObsidianShrine[] = Array.from(dirMap.entries()).map(([dir, dirBlocks]) =>
    analyzeObsidianShrine(dirBlocks, dir),
  )

  const avgVolcanicClarity = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.volcanicClarity, 0) / blocks.length) : 0
  const avgDarkResilience = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.darkResilience, 0) / blocks.length) : 0
  const avgMirrorDepth = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.mirrorDepth, 0) / blocks.length) : 0
  const avgBladePrecision = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.bladePrecision, 0) / blocks.length) : 0
  const avgShadowWisdom = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.shadowWisdom, 0) / blocks.length) : 0

  const overallSharpness = blocks.length > 0
    ? Math.round(blocks.reduce((s, b) => s + b.qualityScore, 0) / blocks.length) : 0
  const isObsidian = overallSharpness >= 60

  const volcano = { avgClarity: avgVolcanicClarity, avgPrecision: avgBladePrecision, avgWisdom: avgShadowWisdom, isObsidian, overallSharpness }

  const obsidianMasterpieceCount = blocks.filter((b) => b.condition === 'obsidian-masterpiece').length
  const volcanicPerfectionCount = blocks.filter((b) => b.condition === 'volcanic-perfection').length
  const properBladeCount = blocks.filter((b) => b.condition === 'proper-blade').length
  const dullGlassCount = blocks.filter((b) => b.condition === 'dull-glass').length
  const shatteredRockCount = blocks.filter((b) => b.condition === 'shattered-rock').length
  const voidCount = blocks.filter((b) => b.condition === 'void').length

  const hasHighClarityCount = blocks.filter((b) => b.revealing.hasHighClarity).length
  const hasHighResilienceCount = blocks.filter((b) => b.enduring.hasHighResilience).length
  const hasHighDepthCount = blocks.filter((b) => b.reflecting.hasHighDepth).length
  const hasHighPrecisionCount = blocks.filter((b) => b.cutting.hasHighPrecision).length
  const hasHighWisdomCount = blocks.filter((b) => b.knowing.hasHighWisdom).length

  const priestGrade = classifyPriestGrade(overallSharpness)

  const bestBlock = blocks.length > 0
    ? blocks.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file : ''
  const clearest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.volcanicClarity > best.volcanicClarity ? b : best)).file : ''
  const mostResilient = blocks.length > 0
    ? blocks.reduce((best, b) => (b.darkResilience > best.darkResilience ? b : best)).file : ''
  const deepest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.mirrorDepth > best.mirrorDepth ? b : best)).file : ''
  const sharpest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.bladePrecision > best.bladePrecision ? b : best)).file : ''
  const wisest = blocks.length > 0
    ? blocks.reduce((best, b) => (b.shadowWisdom > best.shadowWisdom ? b : best)).file : ''

  const stats: ObsidianTempleResult['stats'] = {
    totalFiles: files.length, totalShrines: shrines.length,
    avgVolcanicClarity, avgDarkResilience, avgMirrorDepth, avgBladePrecision, avgShadowWisdom,
    obsidianMasterpieceCount, volcanicPerfectionCount, properBladeCount, dullGlassCount, shatteredRockCount, voidCount,
    hasHighClarityCount, hasHighResilienceCount, hasHighDepthCount, hasHighPrecisionCount, hasHighWisdomCount,
    overallSharpness, priestGrade,
    bestBlock, clearest, mostResilient, deepest, sharpest, wisest,
  }

  const recommendations = generateRecommendations(blocks, shrines, volcano, stats)

  return { blocks, shrines, volcano, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blocks, shrines, volcano, stats) */
export function generateRecommendations(
  blocks: ObsidianBlock[],
  shrines: ObsidianShrine[],
  _volcano: ObsidianTempleResult['volcano'],
  stats: ObsidianTempleResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgVolcanicClarity >= 90 &&
    stats.avgDarkResilience >= 90 &&
    stats.avgMirrorDepth >= 90 &&
    stats.avgBladePrecision >= 90 &&
    stats.avgShadowWisdom >= 90
  ) {
    recs.push(
      'Your obsidian temple is a masterpiece of volcanic glass! Every block is perfectly carved, reflecting truth, cutting with precision, and holding ancient wisdom in its dark depths!',
    )
    return recs
  }

  if (stats.avgVolcanicClarity < 60) {
    recs.push(
      'Polish the volcanic glass — obsidian must be clear enough to see through; your code needs better naming, transparent flow, and self-documenting structure',
    )
  }

  if (stats.avgDarkResilience < 60) {
    recs.push(
      'Harden the dark resilience — obsidian is born from fire and pressure; your code needs stronger error handling, better testing, and defensive boundaries',
    )
  }

  if (stats.avgMirrorDepth < 60) {
    recs.push(
      'Deepen the mirror reflection — obsidian mirrors reveal hidden truths; your code should be well-structured, self-aware, documented, and internally coherent',
    )
  }

  if (stats.avgBladePrecision < 60) {
    recs.push(
      'Sharpen the obsidian blade — the sharpest edge in nature demands type safety, exact types, and surgical precision in every function',
    )
  }

  if (stats.avgShadowWisdom < 60) {
    recs.push(
      'Cultivate shadow wisdom — the dark depths of the temple hold ancient knowledge; your code should be well-architected, principled, and built on accumulated experience',
    )
  }

  if (stats.overallSharpness < 40) {
    recs.push(
      'The obsidian temple has shattered — fragments of volcanic glass litter the ground and no surface reflects anymore',
    )
  }

  const voidBlocks = blocks.filter((b) => b.condition === 'void')
  if (voidBlocks.length > 0 && voidBlocks.length <= 5) {
    recs.push(`Clear these shattered blocks: ${voidBlocks.map((b) => b.file).join(', ')}`)
  } else if (voidBlocks.length > 5) {
    recs.push(`Clear ${voidBlocks.length} shattered blocks before the temple collapses entirely`)
  }

  const poorShrines = shrines.filter((s) => s.condition === 'void' || s.condition === 'rubble')
  if (poorShrines.length === shrines.length && shrines.length > 0) {
    recs.push('All shrine sections have crumbled — the obsidian temple needs complete reconstruction from foundation to spire')
  }

  if (recs.length === 0) {
    recs.push('Your obsidian temple stands strong — each block is carved with clarity, resilience, reflection, precision, and shadow wisdom')
  }

  return recs
}
