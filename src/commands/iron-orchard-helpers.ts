// ─── Interfaces ──────────────────────────────────────────

export interface StructuringMeasure {
  strength: number
  frame:
    | 'wrought-iron-arbor'
    | 'steel-trellis'
    | 'proper-frame'
    | 'rusty-wire'
    | 'rotten-post'
    | 'no-strength'
  hasHighStrength: boolean
  hasWellStructured: boolean
  hasNoChaotic: boolean
  hasModular: boolean
  hasNoMonolithic: boolean
  hasOrganized: boolean
  hasNoScattered: boolean
  hasCleanPipelines: boolean
  hasNoTangled: boolean
  hasEfficient: boolean
  hasNoWasteful: boolean
  hasHarmonious: boolean
  hasElegant: boolean
  hasNatural: boolean
  hasBalanced: boolean
  chaoticCount: number
  tangledCount: number
}

export interface ProtectingMeasure {
  resistance: number
  coating:
    | 'stainless-steel'
    | 'galvanized-iron'
    | 'proper-coating'
    | 'rust-prone'
    | 'corroding'
    | 'no-resistance'
  hasHighResistance: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasMaintained: boolean
  hasNoAbandoned: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasMature: boolean
  hasClean: boolean
  hasEnduring: boolean
  hasDocumented: boolean
  hasConsistent: boolean
  untestedCount: number
  unsafeCount: number
}

export interface FloweringMeasure {
  precision: number
  bloom:
    | 'perfect-timing'
    | 'precise-bloom'
    | 'proper-flower'
    | 'irregular-bud'
    | 'no-bloom'
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
  hasDeterministic: boolean
  hasReliable: boolean
  hasPredictable: boolean
  hasTimed: boolean
  hasFocused: boolean
  wrongCount: number
  buggyCount: number
}

export interface AnchoringMeasure {
  depth: number
  root:
    | 'deep-taproot'
    | 'strong-roots'
    | 'proper-anchoring'
    | 'shallow-roots'
    | 'surface-weed'
    | 'no-depth'
  hasHighDepth: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasNoAdHoc: boolean
  hasDeep: boolean
  hasNoShallow: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasPatterned: boolean
  hasNoReinvented: boolean
  hasMature: boolean
  hasNoNaive: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasFoundational: boolean
  hackedCount: number
  adHocCount: number
}

export interface EnergizingMeasure {
  vitality: number
  forge:
    | 'breathing-fire'
    | 'alive-with-heat'
    | 'proper-forge'
    | 'dying-ember'
    | 'cold-anvil'
    | 'no-vitality'
  hasHighVitality: boolean
  hasExported: boolean
  hasNoIsolated: boolean
  hasEvolving: boolean
  hasNoStagnant: boolean
  hasActive: boolean
  hasNoDead: boolean
  hasContributing: boolean
  hasThriving: boolean
  hasAlive: boolean
  hasConnected: boolean
  hasEnergetic: boolean
  hasVibrant: boolean
  hasGrowing: boolean
  hasAdaptive: boolean
  hasDynamic: boolean
  isolatedCount: number
  deadCount: number
}

export type BloomCondition =
  | 'iron-masterpiece'
  | 'garden-paradise'
  | 'proper-garden'
  | 'weedy-plot'
  | 'rusty-gate'
  | 'void'

export interface IronBloom {
  file: string
  strengthThroughNature: number
  rustResistance: number
  bloomPrecision: number
  rootDepth: number
  forgeVitality: number
  structuring: StructuringMeasure
  protecting: ProtectingMeasure
  flowering: FloweringMeasure
  anchoring: AnchoringMeasure
  energizing: EnergizingMeasure
  condition: BloomCondition
  qualityScore: number
}

export type BedType =
  | 'formal-garden'
  | 'iron-parterre'
  | 'proper-bed'
  | 'small-plot'
  | 'barren-dirt'
  | 'no-bed'

export type BedCondition =
  | 'botanical-palace'
  | 'iron-garden'
  | 'proper-plot'
  | 'weedy-corner'
  | 'rusty-gate'
  | 'void'

export interface IronBed {
  directory: string
  blooms: IronBloom[]
  avgStrength: number
  avgPrecision: number
  avgVitality: number
  ironMasterpieceCount: number
  voidCount: number
  bedType: BedType
  condition: BedCondition
}

export type GardenerGrade =
  | 'iron-botanist'
  | 'garden-architect'
  | 'metal-gardener'
  | 'apprentice'
  | 'novice'
  | 'weed-puller'

export interface IronGardenStats {
  totalFiles: number
  totalBeds: number
  avgStrengthThroughNature: number
  avgRustResistance: number
  avgBloomPrecision: number
  avgRootDepth: number
  avgForgeVitality: number
  ironMasterpieceCount: number
  gardenParadiseCount: number
  properGardenCount: number
  weedyPlotCount: number
  rustyGateCount: number
  voidCount: number
  hasHighStrengthCount: number
  hasHighResistanceCount: number
  hasHighPrecisionCount: number
  hasHighDepthCount: number
  hasHighVitalityCount: number
  overallBloom: number
  gardenerGrade: GardenerGrade
  bestBloom: string
  strongest: string
  mostResistant: string
  mostPrecise: string
  deepest: string
  mostVital: string
}

export interface IronGardenResult {
  blooms: IronBloom[]
  beds: IronBed[]
  landscape: {
    avgStrength: number
    avgPrecision: number
    avgVitality: number
    isIron: boolean
    overallBloom: number
  }
  stats: IronGardenStats
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

/** @example measureStructuring('export class Analyzer { }') */
export function measureStructuring(content: string): StructuringMeasure {
  const hasWellStructured = /\b(class|interface|type|enum)\b/.test(content)
  const chaoticCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasModular = /\b(export)\b/.test(content)
  const hasNoMonolithic = !/\b(monolithic|god.object|mega)\b/i.test(content)
  const hasOrganized = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoScattered = (content.match(/\bvar\b/g) ?? []).length === 0
  const hasCleanPipelines = /\b(import|export|from)\b/.test(content)
  const tangledCount = (content.match(/\b(tangled|spaghetti|messy)\b/gi) ?? []).length
  const hasNoTangled = tangledCount === 0
  const hasEfficient = /\b(const|readonly)\b/.test(content)
  const hasNoWasteful = !/\b(wasteful|inefficient|bloated)\b/i.test(content)
  const hasHarmonious = /\b(try|catch)\b/.test(content)
  const hasElegant = /\b(readonly|private|protected)\b/.test(content)
  const hasNatural = /\b(async|await|Promise)\b/.test(content)
  const hasBalanced = /\b(function|class|interface)\b/.test(content)

  const positiveBooleans = [
    hasWellStructured,
    hasModular,
    hasOrganized,
    hasCleanPipelines,
    hasEfficient,
    hasHarmonious,
    hasElegant,
    hasNatural,
  ]

  const strength = computeScore(positiveBooleans)
  const hasHighStrength = strength >= 60
  const frame = classifyFrame(strength)

  return {
    strength,
    frame,
    hasHighStrength,
    hasWellStructured,
    hasNoChaotic,
    hasModular,
    hasNoMonolithic,
    hasOrganized,
    hasNoScattered,
    hasCleanPipelines,
    hasNoTangled,
    hasEfficient,
    hasNoWasteful,
    hasHarmonious,
    hasElegant,
    hasNatural,
    hasBalanced,
    chaoticCount,
    tangledCount,
  }
}

/** @example measureProtecting('try { safe() } catch { recover() }') */
export function measureProtecting(content: string): ProtectingMeasure {
  const hasTested = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const untestedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasTypeSafe = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const unsafeCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasMaintained = /\b(import|export|from)\b/.test(content)
  const hasNoAbandoned = !/\b(abandoned|deprecated|legacy)\b/i.test(content)
  const hasStable = /\b(class|interface|type|readonly)\b/.test(content)
  const hasNoVolatile = !content.includes('@ts-ignore')
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasClean = (content.match(/\beval\s*\(/g) ?? []).length === 0
  const hasEnduring = /\b(const|readonly)\b/.test(content)
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasConsistent = /\b(readonly|private|protected)\b/.test(content)

  const positiveBooleans = [
    hasTested,
    hasTypeSafe,
    hasMaintained,
    hasStable,
    hasProven,
    hasMature,
    hasClean,
    hasDocumented,
  ]

  const resistance = computeScore(positiveBooleans)
  const hasHighResistance = resistance >= 60
  const coating = classifyCoating(resistance)

  return {
    resistance,
    coating,
    hasHighResistance,
    hasTested,
    hasNoUntested,
    hasTypeSafe,
    hasNoUnsafe,
    hasMaintained,
    hasNoAbandoned,
    hasStable,
    hasNoVolatile,
    hasProven,
    hasNoExperimental,
    hasMature,
    hasClean,
    hasEnduring,
    hasDocumented,
    hasConsistent,
    untestedCount,
    unsafeCount,
  }
}

/** @example measureFlowering('if (x === y) { return true }') */
export function measureFlowering(content: string): FloweringMeasure {
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const wrongCount = (content.match(/\b(wrong|incorrect|bad)\b/gi) ?? []).length
  const hasNoWrong = wrongCount === 0
  const hasExact = /\b(const|readonly)\b/.test(content)
  const hasNoApproximate = !/\b(approximate|rough|roughly)\b/i.test(content)
  const hasCorrect = /\b(try|catch|if|throw)\b/.test(content)
  const buggyCount = (content.match(/\b(bug|buggy|broken)\b/gi) ?? []).length
  const hasNoBuggy = buggyCount === 0
  const hasConsistent = /\b(readonly|as const)\b/.test(content)
  const hasNoErratic = !content.includes('@ts-ignore')
  const hasValidated = /\b(try|catch)\b/.test(content) && /\bif\b/.test(content)
  const hasNoAssumed = !/\b(assume|assumption|guess)\b/i.test(content)
  const hasDeterministic = /\b(readonly|const|as const)\b/.test(content)
  const hasReliable = /\b(class|interface|type)\b/.test(content)
  const hasPredictable = /\b(export|public)\b/.test(content)
  const hasTimed = /\b(async|await|Promise)\b/.test(content)
  const hasFocused = /\b(function|=>|async)\b/.test(content)

  const positiveBooleans = [
    hasAccurate,
    hasExact,
    hasCorrect,
    hasConsistent,
    hasValidated,
    hasDeterministic,
    hasReliable,
    hasTimed,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60
  const bloom = classifyBloom(precision)

  return {
    precision,
    bloom,
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
    hasDeterministic,
    hasReliable,
    hasPredictable,
    hasTimed,
    hasFocused,
    wrongCount,
    buggyCount,
  }
}

/** @example measureAnchoring('export interface Config { readonly name: string }') */
export function measureAnchoring(content: string): AnchoringMeasure {
  const hasWellArchitected = /\b(class|interface|type|enum)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|monkey)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = /\b(readonly|private|protected)\b/.test(content)
  const adHocCount = (content.match(/\bany\b/g) ?? []).length
  const hasNoAdHoc = adHocCount === 0
  const hasDeep = /\b(type|interface|<\w+>)\b/.test(content)
  const hasNoShallow = !content.includes('@ts-ignore')
  const hasProven = /\b(readonly|as const)\b/.test(content)
  const hasNoExperimental = !/\b(experimental|beta|alpha)\b/i.test(content)
  const hasPatterned = /\b(function|class|interface)\b/.test(content)
  const hasNoReinvented = !/\b(reinvent|rewrote|redone)\b/i.test(content)
  const hasMature = /\b(class|interface|type|enum)\b/.test(content)
  const hasNoNaive = !/\b(naive|simple|basic)\b/i.test(content)
  const hasInsightful = /\b(async|await|Promise)\b/.test(content)
  const hasStrategic = /\b(import|export|from)\b/.test(content)
  const hasFoundational = /\b(try|catch|if|throw)\b/.test(content)

  const positiveBooleans = [
    hasWellArchitected,
    hasPrincipled,
    hasDeep,
    hasProven,
    hasMature,
    hasPatterned,
    hasStrategic,
    hasFoundational,
  ]

  const depth = computeScore(positiveBooleans)
  const hasHighDepth = depth >= 60
  const root = classifyRoot(depth)

  return {
    depth,
    root,
    hasHighDepth,
    hasWellArchitected,
    hasNoHacked,
    hasPrincipled,
    hasNoAdHoc,
    hasDeep,
    hasNoShallow,
    hasProven,
    hasNoExperimental,
    hasPatterned,
    hasNoReinvented,
    hasMature,
    hasNoNaive,
    hasInsightful,
    hasStrategic,
    hasFoundational,
    hackedCount,
    adHocCount,
  }
}

/** @example measureEnergizing('export async function run() { await start() }') */
export function measureEnergizing(content: string): EnergizingMeasure {
  const hasExported = /\b(export|public)\b/.test(content)
  const isolatedCount = (content.match(/\bvar\b/g) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasEvolving = /\b(async|await|Promise)\b/.test(content)
  const hasNoStagnant = !/\b(stagnant|stale|dead)\b/i.test(content)
  const hasActive = /\b(function|=>|async)\b/.test(content)
  const deadCount = (content.match(/\b(dead|unused|orphan)\b/gi) ?? []).length
  const hasNoDead = deadCount === 0
  const hasContributing = /\b(export|return)\b/.test(content)
  const hasThriving = /\b(class|interface|type)\b/.test(content)
  const hasAlive = /\b(try|catch|if|throw)\b/.test(content)
  const hasConnected = /\b(import|export|from)\b/.test(content)
  const hasEnergetic = /\b(readonly|private|protected)\b/.test(content)
  const hasVibrant = /\b(const|readonly)\b/.test(content)
  const hasGrowing = /\b(type|interface|<\w+>)\b/.test(content)
  const hasAdaptive = /\b(try|catch|Error|throw)\b/.test(content)
  const hasDynamic = /\b(catch|finally|default)\b/.test(content)

  const positiveBooleans = [
    hasExported,
    hasEvolving,
    hasActive,
    hasContributing,
    hasThriving,
    hasAlive,
    hasConnected,
    hasDynamic,
  ]

  const vitality = computeScore(positiveBooleans)
  const hasHighVitality = vitality >= 60
  const forge = classifyForge(vitality)

  return {
    vitality,
    forge,
    hasHighVitality,
    hasExported,
    hasNoIsolated,
    hasEvolving,
    hasNoStagnant,
    hasActive,
    hasNoDead,
    hasContributing,
    hasThriving,
    hasAlive,
    hasConnected,
    hasEnergetic,
    hasVibrant,
    hasGrowing,
    hasAdaptive,
    hasDynamic,
    isolatedCount,
    deadCount,
  }
}

// ─── Classifiers ────────────────────────────────────────

function classifyFrame(score: number): StructuringMeasure['frame'] {
  if (score >= 90) return 'wrought-iron-arbor'
  if (score >= 75) return 'steel-trellis'
  if (score >= 60) return 'proper-frame'
  if (score >= 40) return 'rusty-wire'
  if (score >= 20) return 'rotten-post'
  return 'no-strength'
}

function classifyCoating(score: number): ProtectingMeasure['coating'] {
  if (score >= 90) return 'stainless-steel'
  if (score >= 75) return 'galvanized-iron'
  if (score >= 60) return 'proper-coating'
  if (score >= 40) return 'rust-prone'
  if (score >= 20) return 'corroding'
  return 'no-resistance'
}

function classifyBloom(score: number): FloweringMeasure['bloom'] {
  if (score >= 90) return 'perfect-timing'
  if (score >= 75) return 'precise-bloom'
  if (score >= 60) return 'proper-flower'
  if (score >= 40) return 'irregular-bud'
  if (score >= 20) return 'no-bloom'
  return 'no-precision'
}

function classifyRoot(score: number): AnchoringMeasure['root'] {
  if (score >= 90) return 'deep-taproot'
  if (score >= 75) return 'strong-roots'
  if (score >= 60) return 'proper-anchoring'
  if (score >= 40) return 'shallow-roots'
  if (score >= 20) return 'surface-weed'
  return 'no-depth'
}

function classifyForge(score: number): EnergizingMeasure['forge'] {
  if (score >= 90) return 'breathing-fire'
  if (score >= 75) return 'alive-with-heat'
  if (score >= 60) return 'proper-forge'
  if (score >= 40) return 'dying-ember'
  if (score >= 20) return 'cold-anvil'
  return 'no-vitality'
}

/** @example classifyCondition(85) */
export function classifyCondition(score: number): BloomCondition {
  if (score >= 90) return 'iron-masterpiece'
  if (score >= 75) return 'garden-paradise'
  if (score >= 60) return 'proper-garden'
  if (score >= 40) return 'weedy-plot'
  if (score >= 20) return 'rusty-gate'
  return 'void'
}

/** @example classifyBedType(blooms) */
export function classifyBedType(blooms: IronBloom[]): BedType {
  if (blooms.length === 0) return 'no-bed'
  const avg = blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length
  if (avg >= 90) return 'formal-garden'
  if (avg >= 75) return 'iron-parterre'
  if (avg >= 60) return 'proper-bed'
  if (avg >= 40) return 'small-plot'
  if (avg >= 20) return 'barren-dirt'
  return 'no-bed'
}

/** @example classifyBedCondition(avgStrength) */
export function classifyBedCondition(avgStrength: number): BedCondition {
  if (avgStrength >= 85) return 'botanical-palace'
  if (avgStrength >= 70) return 'iron-garden'
  if (avgStrength >= 55) return 'proper-plot'
  if (avgStrength >= 35) return 'weedy-corner'
  if (avgStrength >= 15) return 'rusty-gate'
  return 'void'
}

/** @example classifyGardenerGrade(80) */
export function classifyGardenerGrade(avgBloom: number): GardenerGrade {
  if (avgBloom >= 80) return 'iron-botanist'
  if (avgBloom >= 65) return 'garden-architect'
  if (avgBloom >= 50) return 'metal-gardener'
  if (avgBloom >= 35) return 'apprentice'
  if (avgBloom >= 20) return 'novice'
  return 'weed-puller'
}

// ─── Analysis ───────────────────────────────────────────

/** @example analyzeIronBloom(content, 'app.ts') */
export function analyzeIronBloom(content: string, filePath: string): IronBloom {
  const structuring = measureStructuring(content)
  const protecting = measureProtecting(content)
  const flowering = measureFlowering(content)
  const anchoring = measureAnchoring(content)
  const energizing = measureEnergizing(content)

  const strengthThroughNature = structuring.strength
  const rustResistance = protecting.resistance
  const bloomPrecision = flowering.precision
  const rootDepth = anchoring.depth
  const forgeVitality = energizing.vitality

  const qualityScore = Math.round(
    strengthThroughNature * 0.2 +
    rustResistance * 0.2 +
    bloomPrecision * 0.2 +
    rootDepth * 0.2 +
    forgeVitality * 0.2,
  )

  const condition = classifyCondition(qualityScore)

  return {
    file: filePath,
    strengthThroughNature,
    rustResistance,
    bloomPrecision,
    rootDepth,
    forgeVitality,
    structuring,
    protecting,
    flowering,
    anchoring,
    energizing,
    condition,
    qualityScore,
  }
}

/** @example analyzeIronBed(blooms, 'src') */
export function analyzeIronBed(blooms: IronBloom[], dirPath: string): IronBed {
  if (blooms.length === 0) {
    return {
      directory: dirPath,
      blooms: [],
      avgStrength: 0,
      avgPrecision: 0,
      avgVitality: 0,
      ironMasterpieceCount: 0,
      voidCount: 0,
      bedType: 'no-bed',
      condition: 'void',
    }
  }

  const avgStrength = Math.round(
    blooms.reduce((s, b) => s + b.strengthThroughNature, 0) / blooms.length,
  )
  const avgPrecision = Math.round(
    blooms.reduce((s, b) => s + b.bloomPrecision, 0) / blooms.length,
  )
  const avgVitality = Math.round(
    blooms.reduce((s, b) => s + b.forgeVitality, 0) / blooms.length,
  )

  const ironMasterpieceCount = blooms.filter(
    (b) => b.condition === 'iron-masterpiece',
  ).length
  const voidCount = blooms.filter((b) => b.condition === 'void').length

  const bedType = classifyBedType(blooms)
  const avgQuality = Math.round(
    blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length,
  )
  const condition = classifyBedCondition(avgQuality)

  return {
    directory: dirPath,
    blooms,
    avgStrength,
    avgPrecision,
    avgVitality,
    ironMasterpieceCount,
    voidCount,
    bedType,
    condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildIronGardenResult(['a.ts'], [content]) */
export async function buildIronGardenResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<IronGardenResult> {
  const blooms: IronBloom[] = files.map((file, i) =>
    analyzeIronBloom(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, IronBloom[]>()
  for (const bloom of blooms) {
    const dir = bloom.file.includes('/')
      ? bloom.file.substring(0, bloom.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(bloom)
    } else {
      dirMap.set(dir, [bloom])
    }
  }

  const beds: IronBed[] = Array.from(dirMap.entries()).map(([dir, dirBlooms]) =>
    analyzeIronBed(dirBlooms, dir),
  )

  const avgStrength =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.strengthThroughNature, 0) / blooms.length)
      : 0
  const avgPrecision =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.bloomPrecision, 0) / blooms.length)
      : 0
  const avgVitality =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.forgeVitality, 0) / blooms.length)
      : 0

  const overallBloom =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.qualityScore, 0) / blooms.length)
      : 0
  const isIron = overallBloom >= 60

  const landscape = { avgStrength, avgPrecision, avgVitality, isIron, overallBloom }

  const avgStrengthThroughNature = avgStrength
  const avgRustResistance =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.rustResistance, 0) / blooms.length)
      : 0
  const avgBloomPrecision = avgPrecision
  const avgRootDepth =
    blooms.length > 0
      ? Math.round(blooms.reduce((s, b) => s + b.rootDepth, 0) / blooms.length)
      : 0
  const avgForgeVitality = avgVitality

  const ironMasterpieceCount = blooms.filter(
    (b) => b.condition === 'iron-masterpiece',
  ).length
  const gardenParadiseCount = blooms.filter(
    (b) => b.condition === 'garden-paradise',
  ).length
  const properGardenCount = blooms.filter(
    (b) => b.condition === 'proper-garden',
  ).length
  const weedyPlotCount = blooms.filter(
    (b) => b.condition === 'weedy-plot',
  ).length
  const rustyGateCount = blooms.filter(
    (b) => b.condition === 'rusty-gate',
  ).length
  const voidCount = blooms.filter((b) => b.condition === 'void').length

  const hasHighStrengthCount = blooms.filter(
    (b) => b.structuring.hasHighStrength,
  ).length
  const hasHighResistanceCount = blooms.filter(
    (b) => b.protecting.hasHighResistance,
  ).length
  const hasHighPrecisionCount = blooms.filter(
    (b) => b.flowering.hasHighPrecision,
  ).length
  const hasHighDepthCount = blooms.filter(
    (b) => b.anchoring.hasHighDepth,
  ).length
  const hasHighVitalityCount = blooms.filter(
    (b) => b.energizing.hasHighVitality,
  ).length

  const gardenerGrade = classifyGardenerGrade(overallBloom)

  const bestBloom = blooms.length > 0
    ? blooms.reduce((best, b) => (b.qualityScore > best.qualityScore ? b : best)).file
    : ''
  const strongest = blooms.length > 0
    ? blooms.reduce((best, b) => (b.strengthThroughNature > best.strengthThroughNature ? b : best)).file
    : ''
  const mostResistant = blooms.length > 0
    ? blooms.reduce((best, b) => (b.rustResistance > best.rustResistance ? b : best)).file
    : ''
  const mostPrecise = blooms.length > 0
    ? blooms.reduce((best, b) => (b.bloomPrecision > best.bloomPrecision ? b : best)).file
    : ''
  const deepest = blooms.length > 0
    ? blooms.reduce((best, b) => (b.rootDepth > best.rootDepth ? b : best)).file
    : ''
  const mostVital = blooms.length > 0
    ? blooms.reduce((best, b) => (b.forgeVitality > best.forgeVitality ? b : best)).file
    : ''

  const stats: IronGardenStats = {
    totalFiles: files.length,
    totalBeds: beds.length,
    avgStrengthThroughNature,
    avgRustResistance,
    avgBloomPrecision,
    avgRootDepth,
    avgForgeVitality,
    ironMasterpieceCount,
    gardenParadiseCount,
    properGardenCount,
    weedyPlotCount,
    rustyGateCount,
    voidCount,
    hasHighStrengthCount,
    hasHighResistanceCount,
    hasHighPrecisionCount,
    hasHighDepthCount,
    hasHighVitalityCount,
    overallBloom,
    gardenerGrade,
    bestBloom,
    strongest,
    mostResistant,
    mostPrecise,
    deepest,
    mostVital,
  }

  const recommendations = generateRecommendations(blooms, beds, landscape, stats)

  return { blooms, beds, landscape, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(blooms, beds, landscape, stats) */
export function generateRecommendations(
  blooms: IronBloom[],
  beds: IronBed[],
  landscape: IronGardenResult['landscape'],
  stats: IronGardenStats,
): string[] {
  const recs: string[] = []

  if (
    stats.avgStrengthThroughNature >= 90 &&
    stats.avgRustResistance >= 90 &&
    stats.avgBloomPrecision >= 90 &&
    stats.avgRootDepth >= 90 &&
    stats.avgForgeVitality >= 90
  ) {
    recs.push(
      'Your iron garden is a masterpiece where industrial strength and natural beauty grow in perfect harmony!',
    )
    return recs
  }

  if (stats.avgStrengthThroughNature < 60) {
    recs.push(
      'Strengthen the iron framework — let wrought-iron arbors support the organic growth of your code, not constrain it',
    )
  }

  if (stats.avgRustResistance < 60) {
    recs.push(
      'Apply rust resistance — code should resist degradation like galvanized iron that weathers every season',
    )
  }

  if (stats.avgBloomPrecision < 60) {
    recs.push(
      'Refine bloom precision — every flower in the iron garden should open at exactly the right moment',
    )
  }

  if (stats.avgRootDepth < 60) {
    recs.push(
      'Deepen the roots — code foundations should anchor like taproots through the iron lattice into bedrock',
    )
  }

  if (stats.avgForgeVitality < 60) {
    recs.push(
      'Rekindle the forge — the craftsmanship that created the iron garden should breathe life and vitality into every joint',
    )
  }

  if (stats.overallBloom < 40) {
    recs.push(
      'The garden has run wild — prune the weeds and reforge the gates before the iron framework collapses',
    )
  }

  const voidBlooms = blooms.filter((b) => b.condition === 'void')
  if (voidBlooms.length > 0 && voidBlooms.length <= 5) {
    recs.push(
      `Uproot these withered plants: ${voidBlooms.map((b) => b.file).join(', ')}`,
    )
  } else if (voidBlooms.length > 5) {
    recs.push(
      `Uproot these ${voidBlooms.length} withered plants before the blight spreads to healthy beds`,
    )
  }

  const poorBeds = beds.filter(
    (bed) => bed.condition === 'void' || bed.condition === 'weedy-corner',
  )
  if (poorBeds.length === beds.length && beds.length > 0) {
    recs.push(
      'All garden beds are overgrown — the iron orchard needs a complete replanting from seed',
    )
  }

  if (recs.length === 0) {
    recs.push('Your iron orchard thrives with graceful strength — tend each bed and the garden will bloom eternally')
  }

  return recs
}
