// ─── Interfaces ──────────────────────────────────────────

export interface ForgingMeasure {
  strength: number
  alloy:
    | 'titanium-carbide'
    | 'super-alloy'
    | 'proper-alloy'
    | 'weak-mix'
    | 'pure-iron'
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
  hasErrorHandled: boolean
  hasNoBareCrash: boolean
  hasDefensive: boolean
  hasNoNaive: boolean
  hasResilient: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasEnduring: boolean
  chaoticCount: number
  tangledCount: number
}

export interface ExploringMeasure {
  vision: number
  frontier:
    | 'deep-space'
    | 'orbital-station'
    | 'proper-orbit'
    | 'launch-pad'
    | 'grounded'
    | 'no-vision'
  hasHighVision: boolean
  hasExtensible: boolean
  hasNoRigid: boolean
  hasFutureProof: boolean
  hasNoLegacy: boolean
  hasInnovative: boolean
  hasNoStagnant: boolean
  hasScalable: boolean
  hasNoBottlenecked: boolean
  hasAdaptive: boolean
  hasNoStatic: boolean
  hasAbstracted: boolean
  hasNoHardcoded: boolean
  hasVisionary: boolean
  hasNoShortSighted: boolean
  hasExploratory: boolean
  rigidCount: number
  hardcodedCount: number
}

export interface ShieldingMeasure {
  resistance: number
  shield:
    | 'titanium-oxide'
    | 'passive-film'
    | 'proper-coating'
    | 'rust-prone'
    | 'corroding'
    | 'no-resistance'
  hasHighResistance: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasClean: boolean
  hasNoDirty: boolean
  hasEnduring: boolean
  unsafeCount: number
  untestedCount: number
}

export interface OptimizingMeasure {
  efficiency: number
  ratio:
    | 'perfect-ratio'
    | 'lean-alloy'
    | 'proper-weight'
    | 'heavy-iron'
    | 'lead-anchor'
    | 'no-efficiency'
  hasHighEfficiency: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasStreamlined: boolean
  hasNoBloat: boolean
  hasDirect: boolean
  hasNoCircuits: boolean
  hasOptimized: boolean
  hasNoNaive: boolean
  hasConcurrent: boolean
  hasNoSequential: boolean
  hasMinimal: boolean
  hasNoRedundant: boolean
  hasFocused: boolean
  hasNoScattered: boolean
  hasLean: boolean
  wastefulCount: number
  redundantCount: number
}

export interface NavigatingMeasure {
  wisdom: number
  cosmos:
    | 'deep-space-sage'
    | 'orbital-veteran'
    | 'proper-pilot'
    | 'cadet'
    | 'ground-control'
    | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasStrategic: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hackedCount: number
  adHocCount: number
}

export type PanelCondition =
  | 'titanium-masterpiece'
  | 'space-grade'
  | 'proper-alloy'
  | 'earth-bound'
  | 'rusted-hull'
  | 'void'

export interface TitaniumPanel {
  file: string
  alloyStrength: number
  frontierVision: number
  corrosionResistance: number
  weightEfficiency: number
  spaceWisdom: number
  forging: ForgingMeasure
  exploring: ExploringMeasure
  shielding: ShieldingMeasure
  optimizing: OptimizingMeasure
  navigating: NavigatingMeasure
  condition: PanelCondition
  qualityScore: number
}

export type ModuleType =
  | 'space-station'
  | 'orbital-module'
  | 'proper-capsule'
  | 'small-pod'
  | 'ground-structure'
  | 'no-module'

export type ModuleCondition =
  | 'deep-space-station'
  | 'orbital-platform'
  | 'proper-module'
  | 'ground-facility'
  | 'crashed-pod'
  | 'void'

export interface TitaniumModule {
  directory: string
  panels: TitaniumPanel[]
  avgStrength: number
  avgVision: number
  avgWisdom: number
  titaniumMasterpieceCount: number
  voidCount: number
  moduleType: ModuleType
  condition: ModuleCondition
}

export type CommanderGrade =
  | 'space-commander'
  | 'station-captain'
  | 'module-engineer'
  | 'apprentice'
  | 'novice'
  | 'grounded'

export interface TitaniumFrontierStats {
  totalFiles: number
  totalModules: number
  avgAlloyStrength: number
  avgFrontierVision: number
  avgCorrosionResistance: number
  avgWeightEfficiency: number
  avgSpaceWisdom: number
  titaniumMasterpieceCount: number
  spaceGradeCount: number
  properAlloyCount: number
  earthBoundCount: number
  rustedHullCount: number
  voidCount: number
  hasHighStrengthCount: number
  hasHighVisionCount: number
  hasHighResistanceCount: number
  hasHighEfficiencyCount: number
  hasHighWisdomCount: number
  overallGrade: number
  commanderGrade: CommanderGrade
  bestPanel: string
  strongest: string
  mostVisionary: string
  mostResistant: string
  mostEfficient: string
  wisest: string
}

export interface TitaniumFrontierResult {
  panels: TitaniumPanel[]
  modules: TitaniumModule[]
  space: {
    avgStrength: number
    avgVision: number
    avgWisdom: number
    isTitanium: boolean
    overallGrade: number
  }
  stats: TitaniumFrontierStats
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

/** @example measureForging('export function add(): number { }') */
export function measureForging(content: string): ForgingMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\b(chaotic|mess|tangle)\b/gi) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(import|export|from)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|giant|massive)\b/i.test(content)
  const hasCleanPipelines = /\b(return|yield|emit)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|woven)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasRobust = /\b(readonly|private|protected)\b/.test(content)
  const hasNoFragile = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasErrorHandled = /\btry\b/.test(content) && /\bcatch\b/.test(content)
  const bareCrashMatch = (content.match(/\beval\s*\(/g) ?? []).length
  const hasNoBareCrash = bareCrashMatch === 0
  const hasDefensive = /\bif\b/.test(content)
  const hasNoNaive = !/\b(trust|assume|hope)\b/i.test(content)
  const hasResilient = /\b(try|catch|Error|throw)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const hasNoUntested = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasCleanPipelines,
    hasRobust,
    hasErrorHandled,
    hasDefensive,
    hasResilient,
    hasEnduring,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60
  const alloy = classifyAlloy(strength)

  return {
    strength,
    alloy,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasCleanPipelines,
    hasNoTangled,
    hasRobust,
    hasNoFragile,
    hasErrorHandled,
    hasNoBareCrash,
    hasDefensive,
    hasNoNaive,
    hasResilient,
    hasTested,
    hasNoUntested,
    hasEnduring,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureExploring('export interface Config { readonly name: string }') */
export function measureExploring(content: string): ExploringMeasure {
  const hasExtensible = /\b(readonly|private|protected)\b/.test(content)
  const rigidCount = (content.match(/\b(rigid|inflexible|hardcoded)\b/gi) ?? []).length
  const hasNoRigid = rigidCount === 0
  const hasFutureProof = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoLegacy = !/\b(legacy|deprecated|obsolete)\b/i.test(content)
  const hasInnovative = /\b(async|await|Promise)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|stale|outdated)\b/i.test(content)
  const hasScalable = /\b(import|export|from)\b/.test(content)
  const hasNoBottlenecked = !/\b(bottleneck|block|stall)\b/i.test(content)
  const hasAdaptive = /\b(function|class|interface)\b/.test(content)
  const hasNoStatic = !/\b(static|fixed|unchanging)\b/i.test(content)
  const hasAbstracted = /\b(class|interface|type|enum)\b/.test(content)
  const hardcodedCount = (content.match(/\b(hardcoded|magic.number|literal)\b/gi) ?? []).length
  const hasNoHardcoded = hardcodedCount === 0
  const hasVisionary = /\bexport\b/.test(content)
  const hasNoShortSighted = !/\b(shortsighted|myopic|narrow)\b/i.test(content)
  const hasExploratory = /\b(type|interface|<\w+>)\b/.test(content)

  const positiveBooleans = [
    hasExtensible,
    hasFutureProof,
    hasInnovative,
    hasScalable,
    hasAdaptive,
    hasAbstracted,
    hasVisionary,
    hasExploratory,
  ]

  const vision = computeScore(positiveBooleans)
  const hasHighVision = vision >= 60
  const frontier = classifyFrontier(vision)

  return {
    vision,
    frontier,
    hasHighVision,
    hasExtensible,
    hasNoRigid,
    hasFutureProof,
    hasNoLegacy,
    hasInnovative,
    hasNoStagnant,
    hasScalable,
    hasNoBottlenecked,
    hasAdaptive,
    hasNoStatic,
    hasAbstracted,
    hasNoHardcoded,
    hasVisionary,
    hasNoShortSighted,
    hasExploratory,
    rigidCount,
    hardcodedCount,
  }
}

/** @example measureShielding('try { foo() } catch { bar() }') */
export function measureShielding(content: string): ShieldingMeasure {
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasMaintained = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasNoAbandoned = !/\b(abandoned|forgotten|neglected)\b/i.test(content)
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = !/\b(volatile|unstable|changing)\b/i.test(content)
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasClean = !content.includes('@ts-ignore') && !content.includes('@ts-expect-error')
  const hasNoDirty = !/\b(dirty|hack|workaround)\b/i.test(content)
  const hasEnduring = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe,
    hasTested,
    hasMaintained,
    hasStable,
    hasProven,
    hasMature,
    hasClean,
    hasEnduring,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60
  const shield = classifyShield(resistance)

  return {
    resistance,
    shield,
    hasHighResistance,
    hasTypeSafe,
    hasNoUnsafe,
    hasTested,
    hasNoUntested,
    hasMaintained,
    hasNoAbandoned,
    hasStable,
    hasNoVolatile,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasNoNaive,
    hasClean,
    hasNoDirty,
    hasEnduring,
    unsafeCount,
    untestedCount,
  }
}

/** @example measureOptimizing('export async function process(): Promise<void> { }') */
export function measureOptimizing(content: string): OptimizingMeasure {
  const hasEfficient = /\b(readonly|private|protected)\b/.test(content)
  const wastefulCount = (content.match(/\b(wasteful|bloated|inefficient)\b/gi) ?? []).length
  const hasNoWasteful = wastefulCount === 0
  const hasStreamlined = /\b(import|export|from)\b/.test(content)
  const hasNoBloat = !/\b(bloated|overweight|heavy)\b/i.test(content)
  const hasDirect = /\b(return|yield|emit|produce)\b/.test(content)
  const hasNoCircuits = !/\b(circuit|spaghetti|tangle)\b/i.test(content)
  const hasOptimized = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoNaive = !/\b(naive|brute|force)\b/i.test(content)
  const hasConcurrent = /\b(async|await|Promise)\b/.test(content)
  const hasNoSequential = !/\b(sequential|blocking|sync)\b/i.test(content)
  const hasMinimal = !content.includes('@ts-ignore')
  const redundantCount = (content.match(/\b(redundant|duplicate|repeat)\b/gi) ?? []).length
  const hasNoRedundant = redundantCount === 0
  const hasFocused = /\b(function|class|interface)\b/.test(content)
  const hasNoScattered = !/\b(scattered|fragmented|dispersed)\b/i.test(content)
  const hasLean = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasEfficient,
    hasStreamlined,
    hasDirect,
    hasOptimized,
    hasConcurrent,
    hasMinimal,
    hasFocused,
    hasLean,
  ]

  const efficiency = computeScore(positiveBooleans)
  const hasHighEfficiency = efficiency >= 60
  const ratio = classifyRatio(efficiency)

  return {
    efficiency,
    ratio,
    hasHighEfficiency,
    hasEfficient,
    hasNoWasteful,
    hasStreamlined,
    hasNoBloat,
    hasDirect,
    hasNoCircuits,
    hasOptimized,
    hasNoNaive,
    hasConcurrent,
    hasNoSequential,
    hasMinimal,
    hasNoRedundant,
    hasFocused,
    hasNoScattered,
    hasLean,
    wastefulCount,
    redundantCount,
  }
}

/** @example measureNavigating('export const WISDOM = true as const') */
export function measureNavigating(content: string): NavigatingMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasStrategic = /\b(async|await|Promise)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\bexport\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasProven,
    hasDeep,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasInsightful,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60
  const cosmos = classifyCosmos(wisdom)

  return {
    wisdom,
    cosmos,
    hasHighWisdom,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasProven,
    hasNoExperimental,
    hasDeep,
    hasNoShallow,
    hasMature,
    hasNoNaive,
    hasPatterned,
    hasNoReinvented,
    hasStrategic,
    hasInsightful,
    hasVisionary,
    hackedCount,
    adHocCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyAlloy(score: number): ForgingMeasure['alloy'] {
  if (score >= 90) return 'titanium-carbide'
  if (score >= 75) return 'super-alloy'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'weak-mix'
  if (score >= 20) return 'pure-iron'
  return 'no-strength'
}

function classifyFrontier(score: number): ExploringMeasure['frontier'] {
  if (score >= 90) return 'deep-space'
  if (score >= 75) return 'orbital-station'
  if (score >= 60) return 'proper-orbit'
  if (score >= 40) return 'launch-pad'
  if (score >= 20) return 'grounded'
  return 'no-vision'
}

function classifyShield(score: number): ShieldingMeasure['shield'] {
  if (score >= 90) return 'titanium-oxide'
  if (score >= 75) return 'passive-film'
  if (score >= 60) return 'proper-coating'
  if (score >= 40) return 'rust-prone'
  if (score >= 20) return 'corroding'
  return 'no-resistance'
}

function classifyRatio(score: number): OptimizingMeasure['ratio'] {
  if (score >= 90) return 'perfect-ratio'
  if (score >= 75) return 'lean-alloy'
  if (score >= 60) return 'proper-weight'
  if (score >= 40) return 'heavy-iron'
  if (score >= 20) return 'lead-anchor'
  return 'no-efficiency'
}

function classifyCosmos(score: number): NavigatingMeasure['cosmos'] {
  if (score >= 90) return 'deep-space-sage'
  if (score >= 75) return 'orbital-veteran'
  if (score >= 60) return 'proper-pilot'
  if (score >= 40) return 'cadet'
  if (score >= 20) return 'ground-control'
  return 'no-wisdom'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): PanelCondition {
  if (score >= 90) return 'titanium-masterpiece'
  if (score >= 75) return 'space-grade'
  if (score >= 60) return 'proper-alloy'
  if (score >= 40) return 'earth-bound'
  if (score >= 20) return 'rusted-hull'
  return 'void'
}

/** @example classifyModuleType(panels) */
export function classifyModuleType(panels: TitaniumPanel[]): ModuleType {
  if (panels.length === 0) return 'no-module'
  const avg = panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length
  if (avg >= 90) return 'space-station'
  if (avg >= 75) return 'orbital-module'
  if (avg >= 60) return 'proper-capsule'
  if (avg >= 40) return 'small-pod'
  if (avg >= 20) return 'ground-structure'
  return 'no-module'
}

/** @example classifyModuleCondition(avgStrength) */
export function classifyModuleCondition(avgStrength: number): ModuleCondition {
  if (avgStrength >= 85) return 'deep-space-station'
  if (avgStrength >= 70) return 'orbital-platform'
  if (avgStrength >= 55) return 'proper-module'
  if (avgStrength >= 35) return 'ground-facility'
  if (avgStrength >= 15) return 'crashed-pod'
  return 'void'
}

/** @example classifyCommanderGrade(80) */
export function classifyCommanderGrade(avgGrade: number): CommanderGrade {
  if (avgGrade >= 80) return 'space-commander'
  if (avgGrade >= 65) return 'station-captain'
  if (avgGrade >= 50) return 'module-engineer'
  if (avgGrade >= 35) return 'apprentice'
  if (avgGrade >= 20) return 'novice'
  return 'grounded'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeTitaniumPanel(content, 'app.ts') */
export function analyzeTitaniumPanel(content: string, filePath: string): TitaniumPanel {
  const forging = measureForging(content)
  const exploring = measureExploring(content)
  const shielding = measureShielding(content)
  const optimizing = measureOptimizing(content)
  const navigating = measureNavigating(content)

  const alloyStrength = forging.strength
  const frontierVision = exploring.vision
  const corrosionResistance = shielding.resistance
  const weightEfficiency = optimizing.efficiency
  const spaceWisdom = navigating.wisdom

  const qualityScore = Math.round(
    alloyStrength * 0.2 +
    frontierVision * 0.2 +
    corrosionResistance * 0.2 +
    weightEfficiency * 0.2 +
    spaceWisdom * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    alloyStrength,
    frontierVision,
    corrosionResistance,
    weightEfficiency,
    spaceWisdom,
    forging,
    exploring,
    shielding,
    optimizing,
    navigating,
    condition,
    qualityScore,
  }
}

/** @example analyzeTitaniumModule(panels, 'src') */
export function analyzeTitaniumModule(panels: TitaniumPanel[], dirPath: string): TitaniumModule {
  if (panels.length === 0) {
    return {
      directory: dirPath,
      panels: [],
      avgStrength: 0,
      avgVision: 0,
      avgWisdom: 0,
      titaniumMasterpieceCount: 0,
      voidCount: 0,
      moduleType: 'no-module',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(
    panels.reduce((s, p) => s + p.alloyStrength, 0) / panels.length,
  )
  const avgVision = Math.round(
    panels.reduce((s, p) => s + p.frontierVision, 0) / panels.length,
  )
  const avgWisdom = Math.round(
    panels.reduce((s, p) => s + p.spaceWisdom, 0) / panels.length,
  )

  const titaniumMasterpieceCount = panels.filter(
    (p) => p.condition === 'titanium-masterpiece',
  ).length
  const voidCount = panels.filter((p) => p.condition === 'void').length

  const moduleType = classifyModuleType(panels)
  const avgQuality = Math.round(
    panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length,
  )
  const condition = classifyModuleCondition(avgQuality)

  return {
    directory: dirPath,
    panels,
    avgStrength,
    avgVision,
    avgWisdom,
    titaniumMasterpieceCount,
    voidCount,
    moduleType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildTitaniumFrontierResult(['a.ts'], [content]) */
export async function buildTitaniumFrontierResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<TitaniumFrontierResult> {
  const panels: TitaniumPanel[] = files.map((file, i) =>
    analyzeTitaniumPanel(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, TitaniumPanel[]>()
  for (const panel of panels) {
    const dir = panel.file.includes('/')
      ? panel.file.substring(0, panel.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(panel)
    } else {
      dirMap.set(dir, [panel])
    }
  }

  const modules: TitaniumModule[] = Array.from(dirMap.entries()).map(([dir, dirPanels]) =>
    analyzeTitaniumModule(dirPanels, dir),
  )

  const avgStrength =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.alloyStrength, 0) / panels.length)
      : 0
  const avgVision =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.frontierVision, 0) / panels.length)
      : 0
  const avgWisdom =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.spaceWisdom, 0) / panels.length)
      : 0

  const overallGrade =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length)
      : 0
  const isTitanium = overallGrade >= 60

  const space = { avgStrength, avgVision, avgWisdom, isTitanium, overallGrade }

  const avgAlloyStrength = avgStrength
  const avgFrontierVision = avgVision
  const avgCorrosionResistance =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.corrosionResistance, 0) / panels.length)
      : 0
  const avgWeightEfficiency =
    panels.length > 0
      ? Math.round(panels.reduce((s, p) => s + p.weightEfficiency, 0) / panels.length)
      : 0
  const avgSpaceWisdom = avgWisdom

  const titaniumMasterpieceCount = panels.filter(
    (p) => p.condition === 'titanium-masterpiece',
  ).length
  const spaceGradeCount = panels.filter((p) => p.condition === 'space-grade').length
  const properAlloyCount = panels.filter((p) => p.condition === 'proper-alloy').length
  const earthBoundCount = panels.filter((p) => p.condition === 'earth-bound').length
  const rustedHullCount = panels.filter((p) => p.condition === 'rusted-hull').length
  const voidCount = panels.filter((p) => p.condition === 'void').length

  const hasHighStrengthCount = panels.filter((p) => p.forging.hasHighStrength).length
  const hasHighVisionCount = panels.filter((p) => p.exploring.hasHighVision).length
  const hasHighResistanceCount = panels.filter((p) => p.shielding.hasHighResistance).length
  const hasHighEfficiencyCount = panels.filter((p) => p.optimizing.hasHighEfficiency).length
  const hasHighWisdomCount = panels.filter((p) => p.navigating.hasHighWisdom).length

  const commanderGrade = classifyCommanderGrade(overallGrade)

  const bestPanel = panels.length > 0
    ? panels.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file
    : ''
  const strongest = panels.length > 0
    ? panels.reduce((best, p) => (p.alloyStrength > best.alloyStrength ? p : best)).file
    : ''
  const mostVisionary = panels.length > 0
    ? panels.reduce((best, p) => (p.frontierVision > best.frontierVision ? p : best)).file
    : ''
  const mostResistant = panels.length > 0
    ? panels.reduce((best, p) => (p.corrosionResistance > best.corrosionResistance ? p : best)).file
    : ''
  const mostEfficient = panels.length > 0
    ? panels.reduce((best, p) => (p.weightEfficiency > best.weightEfficiency ? p : best)).file
    : ''
  const wisest = panels.length > 0
    ? panels.reduce((best, p) => (p.spaceWisdom > best.spaceWisdom ? p : best)).file
    : ''

  const stats: TitaniumFrontierStats = {
    totalFiles: files.length,
    totalModules: modules.length,
    avgAlloyStrength,
    avgFrontierVision,
    avgCorrosionResistance,
    avgWeightEfficiency,
    avgSpaceWisdom,
    titaniumMasterpieceCount,
    spaceGradeCount,
    properAlloyCount,
    earthBoundCount,
    rustedHullCount,
    voidCount,
    hasHighStrengthCount,
    hasHighVisionCount,
    hasHighResistanceCount,
    hasHighEfficiencyCount,
    hasHighWisdomCount,
    overallGrade,
    commanderGrade,
    bestPanel,
    strongest,
    mostVisionary,
    mostResistant,
    mostEfficient,
    wisest,
  }

  const recommendations = generateRecommendations(panels, modules, space, stats)

  return { panels, modules, space, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(panels, modules, space, stats) */
export function generateRecommendations(
  panels: TitaniumPanel[],
  modules: TitaniumModule[],
  space: TitaniumFrontierResult['space'],
  stats: TitaniumFrontierStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgAlloyStrength >= 90 &&
    stats.avgFrontierVision >= 90 &&
    stats.avgCorrosionResistance >= 90 &&
    stats.avgWeightEfficiency >= 90 &&
    stats.avgSpaceWisdom >= 90
  ) {
    recs.push(
      'Your titanium frontier gleams with space-grade perfection! Every panel is a masterpiece of alloy engineering and cosmic wisdom',
    )
    return recs
  }

  if (stats.avgAlloyStrength < 60) {
    recs.push(
      'Strengthen alloy composition — code should combine approaches like titanium combines with carbon for unmatched strength',
    )
  }

  if (stats.avgFrontierVision < 60) {
    recs.push(
      'Expand frontier vision — code must look beyond the horizon like a space probe charting unknown galaxies',
    )
  }

  if (stats.avgCorrosionResistance < 60) {
    recs.push(
      'Improve corrosion resistance — code should resist degradation like titanium oxide protects against the harshest environments',
    )
  }

  if (stats.avgWeightEfficiency < 60) {
    recs.push(
      'Optimize weight efficiency — code should achieve maximum impact with minimum mass, like titanium in spacecraft design',
    )
  }

  if (stats.avgSpaceWisdom < 60) {
    recs.push(
      'Deepen space wisdom — code should carry knowledge from operating at the extremes, where space teaches what earth cannot',
    )
  }

  if (stats.overallGrade < 40) {
    recs.push(
      'The hull is compromised — rebuild the titanium structure before the frontier collapses into rust',
    )
  }

  const voidPanels = panels.filter((p) => p.condition === 'void')
  if (voidPanels.length > 0 && voidPanels.length <= 5) {
    recs.push(
      `Repair these compromised panels: ${voidPanels.map((p) => p.file).join(', ')}`,
    )
  } else if (voidPanels.length > 5) {
    recs.push(
      `Repair these ${voidPanels.length} compromised panels before the entire structure fails`,
    )
  }

  const poorModules = modules.filter(
    (m) => m.condition === 'void' || m.condition === 'crashed-pod',
  )
  if (poorModules.length === modules.length && modules.length > 0) {
    recs.push(
      'All modules show structural failure — consider a complete redesign of the titanium frontier',
    )
  }

  if (recs.length === 0) {
    recs.push('Your titanium frontier holds strong against the void — keep building with space-grade wisdom')
  }

  return recs
}
