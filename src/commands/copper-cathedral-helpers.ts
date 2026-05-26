// ─── Interfaces ──────────────────────────────────────────

export interface AgingMeasure {
  patina: number
  verdigris: 'noble-patina' | 'aged-beauty' | 'proper-weathering' | 'tarnished-metal' | 'raw-copper' | 'no-patina'
  hasHighPatina: boolean
  hasMature: boolean
  hasNoImmature: boolean
  hasProven: boolean
  hasNoExperimental: boolean
  hasStable: boolean
  hasNoVolatile: boolean
  hasEvolved: boolean
  hasRefined: boolean
  hasWeathered: boolean
  hasSeasoned: boolean
  hasAged: boolean
  hasTested: boolean
  hasEnduring: boolean
  hasVenerable: boolean
  hasEstablished: boolean
  immatureCount: number
  volatileCount: number
}

export interface FlowingMeasure {
  grace: number
  current: 'superconductor' | 'excellent-conductor' | 'proper-flow' | 'resistive-wire' | 'broken-circuit' | 'no-grace'
  hasHighGrace: boolean
  hasWellStructured: boolean
  hasNoSpaghetti: boolean
  hasConnected: boolean
  hasNoIsolated: boolean
  hasModular: boolean
  hasFlowing: boolean
  hasOrganized: boolean
  hasCoherent: boolean
  hasHarmonious: boolean
  hasIntegrated: boolean
  hasLinked: boolean
  hasNetworked: boolean
  hasSeamless: boolean
  hasFluid: boolean
  hasSmooth: boolean
  spaghettiCount: number
  isolatedCount: number
}

export interface ShapingMeasure {
  precision: number
  craft: 'master-smith' | 'skilled-forge' | 'proper-hammer' | 'clumsy-anvil' | 'unshaped-ore' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasClean: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasPolished: boolean
  hasRefined: boolean
  hasCrafted: boolean
  hasHoned: boolean
  hasShaped: boolean
  unsafeCount: number
  approximateCount: number
}

export interface WarmingMeasure {
  endurance: number
  heat: 'eternal-flame' | 'steady-furnace' | 'proper-warmth' | 'cooling-ember' | 'cold-hearth' | 'no-endurance'
  hasHighEndurance: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasDurable: boolean
  hasEnduring: boolean
  hasLasting: boolean
  hasResilient: boolean
  hasHardy: boolean
  hasSteadfast: boolean
  hasPersistent: boolean
  hasUnfailing: boolean
  hasAbiding: boolean
  unhandledCount: number
  untestedCount: number
}

export interface MasteringMeasure {
  mastery: number
  skill: 'ancient-master' | 'veteran-craftsman' | 'proper-artisan' | 'young-apprentice' | 'new-student' | 'no-mastery'
  hasHighMastery: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasStrategic: boolean
  hasHolistic: boolean
  hasProven: boolean
  hasMature: boolean
  hasInsightful: boolean
  hasVisionary: boolean
  hasComprehensive: boolean
  hasConnected: boolean
  hasExperienced: boolean
  hasWise: boolean
  hasVenerable: boolean
  hackedCount: number
  shallowCount: number
}

export type PanelCondition =
  | 'copper-masterpiece'
  | 'verdigris-gem'
  | 'proper-copper'
  | 'tarnished-metal'
  | 'raw-ore'
  | 'void'

export interface CopperPanel {
  file: string
  patinaWisdom: number
  conductiveGrace: number
  forgePrecision: number
  warmthEndurance: number
  agedMastery: number
  aging: AgingMeasure
  flowing: FlowingMeasure
  shaping: ShapingMeasure
  warming: WarmingMeasure
  mastering: MasteringMeasure
  condition: PanelCondition
  qualityScore: number
}

export type SpireType =
  | 'grand-cathedral'
  | 'proper-church'
  | 'chapel'
  | 'shrine'
  | 'ruin'
  | 'no-spire'

export type SpireCondition =
  | 'copper-palace'
  | 'green-dome'
  | 'proper-temple'
  | 'tin-roof'
  | 'empty-lot'
  | 'void'

export interface CopperSpire {
  directory: string
  panels: CopperPanel[]
  avgPatina: number
  avgPrecision: number
  avgMastery: number
  copperMasterpieceCount: number
  voidCount: number
  spireType: SpireType
  condition: SpireCondition
}

export type ArchitectGrade = 'master-architect' | 'cathedral-builder' | 'proper-mason' | 'apprentice' | 'novice' | 'stone-carrier'

export interface CopperCathedralResult {
  panels: CopperPanel[]
  spires: CopperSpire[]
  nave: {
    avgPatina: number
    avgPrecision: number
    avgMastery: number
    isCopper: boolean
    overallWarmth: number
  }
  stats: {
    totalFiles: number
    totalSpires: number
    avgPatinaWisdom: number
    avgConductiveGrace: number
    avgForgePrecision: number
    avgWarmthEndurance: number
    avgAgedMastery: number
    copperMasterpieceCount: number
    verdigrisGemCount: number
    properCopperCount: number
    tarnishedMetalCount: number
    rawOreCount: number
    voidCount: number
    hasHighPatinaCount: number
    hasHighGraceCount: number
    hasHighPrecisionCount: number
    hasHighEnduranceCount: number
    hasHighMasteryCount: number
    overallWarmth: number
    architectGrade: ArchitectGrade
    bestPanel: string
    wisest: string
    mostGraceful: string
    mostPrecise: string
    mostEnduring: string
    mostMasterful: string
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

/** @example classifyPanelCondition(90) */
export function classifyPanelCondition(score: number): PanelCondition {
  if (score >= 90) return 'copper-masterpiece'
  if (score >= 75) return 'verdigris-gem'
  if (score >= 60) return 'proper-copper'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'raw-ore'
  return 'void'
}

/** @example classifySpireType(panels) */
export function classifySpireType(panels: CopperPanel[]): SpireType {
  if (panels.length === 0) return 'no-spire'
  const avg = panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length
  if (avg >= 85) return 'grand-cathedral'
  if (avg >= 70) return 'proper-church'
  if (avg >= 55) return 'chapel'
  if (avg >= 35) return 'shrine'
  return 'ruin'
}

/** @example classifySpireCondition(85) */
export function classifySpireCondition(score: number): SpireCondition {
  if (score >= 85) return 'copper-palace'
  if (score >= 70) return 'green-dome'
  if (score >= 55) return 'proper-temple'
  if (score >= 35) return 'tin-roof'
  if (score >= 15) return 'empty-lot'
  return 'void'
}

/** @example classifyArchitectGrade(80) */
export function classifyArchitectGrade(avgWarmth: number): ArchitectGrade {
  if (avgWarmth >= 80) return 'master-architect'
  if (avgWarmth >= 65) return 'cathedral-builder'
  if (avgWarmth >= 50) return 'proper-mason'
  if (avgWarmth >= 35) return 'apprentice'
  if (avgWarmth >= 20) return 'novice'
  return 'stone-carrier'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureAging('export class X { readonly y: string }') */
export function measureAging(content: string): AgingMeasure {
  const hasMature = /\b(class|interface|type)\b/.test(content)
  const immatureCount = (content.match(/\b(immature|unripe|greenhorn|novice)\b/gi) ?? []).length
  const hasNoImmature = immatureCount === 0
  const hasProven = /\b(import|export)\b/.test(content)
  const hasNoExperimental = (content.match(/\b(experimental|prototype|tentative)\b/gi) ?? []).length === 0
  const hasStable = /\b(const|readonly)\b/.test(content)
  const hasNoVolatile = (content.match(/\b(volatile|unstable|flaky)\b/gi) ?? []).length === 0
  const hasEvolved = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasWeathered = /\b(try|catch|if)\b/.test(content)
  const hasSeasoned = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasAged = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasTested = /\b(async|await|Promise)\b/.test(content)
  const hasEnduring = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasVenerable = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasEstablished = /\b(function|=>|return)\b/.test(content)
  const volatileCount = (content.match(/\b(volatile|unstable|flaky)\b/gi) ?? []).length

  const positiveBooleans = [
    hasMature, hasNoImmature, hasProven, hasNoExperimental, hasStable,
    hasNoVolatile, hasEvolved, hasRefined, hasWeathered, hasSeasoned,
    hasAged, hasTested, hasEnduring, hasVenerable, hasEstablished,
  ]

  const patina = computeScore(positiveBooleans)
  const hasHighPatina = patina >= 60

  let verdigris: AgingMeasure['verdigris'] = 'no-patina'
  if (patina >= 90) verdigris = 'noble-patina'
  else if (patina >= 75) verdigris = 'aged-beauty'
  else if (patina >= 60) verdigris = 'proper-weathering'
  else if (patina >= 40) verdigris = 'tarnished-metal'
  else if (patina >= 20) verdigris = 'raw-copper'

  return {
    patina, verdigris, hasHighPatina,
    hasMature, hasNoImmature, hasProven, hasNoExperimental, hasStable,
    hasNoVolatile, hasEvolved, hasRefined, hasWeathered, hasSeasoned,
    hasAged, hasTested, hasEnduring, hasVenerable, hasEstablished,
    immatureCount, volatileCount,
  }
}

/** @example measureFlowing('export class X { readonly y: string }') */
export function measureFlowing(content: string): FlowingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const spaghettiCount = (content.match(/\b(spaghetti|tangled|messy|knotted)\b/gi) ?? []).length
  const hasNoSpaghetti = spaghettiCount === 0
  const hasConnected = /\b(import|export)\b/.test(content)
  const isolatedCount = (content.match(/\b(isolated|orphan|disconnected|stranded)\b/gi) ?? []).length
  const hasNoIsolated = isolatedCount === 0
  const hasModular = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasFlowing = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasCoherent = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasHarmonious = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasIntegrated = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasLinked = /\b(try|catch|if)\b/.test(content)
  const hasNetworked = /\b(async|await|Promise)\b/.test(content)
  const hasSeamless = !/\bany\b/.test(content)
  const hasFluid = /\b(function|=>|return)\b/.test(content)
  const hasSmooth = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoSpaghetti, hasConnected, hasNoIsolated, hasModular,
    hasFlowing, hasOrganized, hasCoherent, hasHarmonious, hasIntegrated,
    hasLinked, hasNetworked, hasSeamless, hasFluid, hasSmooth,
  ]

  const grace = computeScore(positiveBooleans)
  const hasHighGrace = grace >= 60

  let current: FlowingMeasure['current'] = 'no-grace'
  if (grace >= 90) current = 'superconductor'
  else if (grace >= 75) current = 'excellent-conductor'
  else if (grace >= 60) current = 'proper-flow'
  else if (grace >= 40) current = 'resistive-wire'
  else if (grace >= 20) current = 'broken-circuit'

  return {
    grace, current, hasHighGrace,
    hasWellStructured, hasNoSpaghetti, hasConnected, hasNoIsolated, hasModular,
    hasFlowing, hasOrganized, hasCoherent, hasHarmonious, hasIntegrated,
    hasLinked, hasNetworked, hasSeamless, hasFluid, hasSmooth,
    spaghettiCount, isolatedCount,
  }
}

/** @example measureShaping('export class X { readonly y: string }') */
export function measureShaping(content: string): ShapingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasPolished = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasRefined = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasCrafted = /\b(try|catch|if)\b/.test(content)
  const hasHoned = /\b(async|await|Promise)\b/.test(content)
  const hasShaped = /\b(const|readonly)\b/.test(content)

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasSharp, hasCrisp, hasDefined,
    hasPolished, hasRefined, hasCrafted, hasHoned, hasShaped,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let craft: ShapingMeasure['craft'] = 'no-precision'
  if (precision >= 90) craft = 'master-smith'
  else if (precision >= 75) craft = 'skilled-forge'
  else if (precision >= 60) craft = 'proper-hammer'
  else if (precision >= 40) craft = 'clumsy-anvil'
  else if (precision >= 20) craft = 'unshaped-ore'

  return {
    precision, craft, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasClean, hasPrecise, hasSharp, hasCrisp, hasDefined,
    hasPolished, hasRefined, hasCrafted, hasHoned, hasShaped,
    unsafeCount, approximateCount,
  }
}

/** @example measureWarming('try { } catch (e) { }') */
export function measureWarming(content: string): WarmingMeasure {
  const hasErrorHandled = /\b(try|catch|finally)\b/.test(content)
  const unhandledCount = (content.match(/\b(unsafe|unchecked|risky)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|===|!==)\b/.test(content)
  const hasRobust = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasDurable = /\b(const|readonly)\b/.test(content)
  const hasEnduring = /\b(readonly|private|protected)\b/.test(content)
  const hasLasting = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasResilient = /\b(import|export)\b/.test(content)
  const hasHardy = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasSteadfast = !/\bany\b/.test(content)
  const hasPersistent = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasUnfailing = /\b(class|interface|type)\b/.test(content)
  const hasAbiding = /\/\*\*[\s\S]*?\*\//.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasDurable, hasEnduring, hasLasting, hasResilient,
    hasHardy, hasSteadfast, hasPersistent, hasUnfailing, hasAbiding,
  ]

  const endurance = computeScore(positiveBooleans)
  const hasHighEndurance = endurance >= 60

  let heat: WarmingMeasure['heat'] = 'no-endurance'
  if (endurance >= 90) heat = 'eternal-flame'
  else if (endurance >= 75) heat = 'steady-furnace'
  else if (endurance >= 60) heat = 'proper-warmth'
  else if (endurance >= 40) heat = 'cooling-ember'
  else if (endurance >= 20) heat = 'cold-hearth'

  return {
    endurance, heat, hasHighEndurance,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasDurable, hasEnduring, hasLasting, hasResilient,
    hasHardy, hasSteadfast, hasPersistent, hasUnfailing, hasAbiding,
    unhandledCount, untestedCount,
  }
}

/** @example measureMastering('export class X { readonly y: string }') */
export function measureMastering(content: string): MasteringMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasStrategic = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasHolistic = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasProven = /\b(readonly|private|protected)\b/.test(content)
  const hasMature = /\b(import|export)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasVisionary = /\b(async|await|Promise)\b/.test(content)
  const hasComprehensive = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(function|=>|return)\b/.test(content)
  const hasExperienced = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length === 0
  const hasVenerable = /\b(const|readonly)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasExperienced, hasWise, hasVenerable,
  ]

  const mastery = computeScore(positiveBooleans)
  const hasHighMastery = mastery >= 60

  let skill: MasteringMeasure['skill'] = 'no-mastery'
  if (mastery >= 90) skill = 'ancient-master'
  else if (mastery >= 75) skill = 'veteran-craftsman'
  else if (mastery >= 60) skill = 'proper-artisan'
  else if (mastery >= 40) skill = 'young-apprentice'
  else if (mastery >= 20) skill = 'new-student'

  return {
    mastery, skill, hasHighMastery,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasExperienced, hasWise, hasVenerable,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCopperPanel(content, 'app.ts') */
export function analyzeCopperPanel(content: string, filePath: string): CopperPanel {
  const aging = measureAging(content)
  const flowing = measureFlowing(content)
  const shaping = measureShaping(content)
  const warming = measureWarming(content)
  const mastering = measureMastering(content)

  const patinaWisdom = aging.patina
  const conductiveGrace = flowing.grace
  const forgePrecision = shaping.precision
  const warmthEndurance = warming.endurance
  const agedMastery = mastering.mastery

  const qualityScore = Math.round(
    patinaWisdom * 0.2 +
    conductiveGrace * 0.2 +
    forgePrecision * 0.2 +
    warmthEndurance * 0.2 +
    agedMastery * 0.2,
  )

  const condition = classifyPanelCondition(qualityScore)

  return {
    file: filePath,
    patinaWisdom, conductiveGrace, forgePrecision, warmthEndurance, agedMastery,
    aging, flowing, shaping, warming, mastering,
    condition, qualityScore,
  }
}

/** @example analyzeCopperSpire(panels, 'src') */
export function analyzeCopperSpire(panels: CopperPanel[], dirPath: string): CopperSpire {
  if (panels.length === 0) {
    return {
      directory: dirPath, panels: [],
      avgPatina: 0, avgPrecision: 0, avgMastery: 0,
      copperMasterpieceCount: 0, voidCount: 0,
      spireType: 'no-spire', condition: 'void',
    }
  }

  const avgPatina = Math.round(panels.reduce((s, p) => s + p.patinaWisdom, 0) / panels.length)
  const avgPrecision = Math.round(panels.reduce((s, p) => s + p.forgePrecision, 0) / panels.length)
  const avgMastery = Math.round(panels.reduce((s, p) => s + p.agedMastery, 0) / panels.length)
  const copperMasterpieceCount = panels.filter((p) => p.condition === 'copper-masterpiece').length
  const voidCount = panels.filter((p) => p.condition === 'void').length
  const spireType = classifySpireType(panels)
  const avgQuality = Math.round(panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length)
  const condition = classifySpireCondition(avgQuality)

  return {
    directory: dirPath, panels,
    avgPatina, avgPrecision, avgMastery,
    copperMasterpieceCount, voidCount,
    spireType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCopperCathedralResult(['a.ts'], [content]) */
export async function buildCopperCathedralResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperCathedralResult> {
  const panels: CopperPanel[] = files.map((file, i) =>
    analyzeCopperPanel(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperPanel[]>()
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

  const spires: CopperSpire[] = Array.from(dirMap.entries()).map(([dir, dirPanels]) =>
    analyzeCopperSpire(dirPanels, dir),
  )

  const avgPatinaWisdom = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.patinaWisdom, 0) / panels.length) : 0
  const avgConductiveGrace = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.conductiveGrace, 0) / panels.length) : 0
  const avgForgePrecision = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.forgePrecision, 0) / panels.length) : 0
  const avgWarmthEndurance = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.warmthEndurance, 0) / panels.length) : 0
  const avgAgedMastery = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.agedMastery, 0) / panels.length) : 0

  const overallWarmth = panels.length > 0
    ? Math.round(panels.reduce((s, p) => s + p.qualityScore, 0) / panels.length) : 0
  const isCopper = overallWarmth >= 60

  const nave: CopperCathedralResult['nave'] = {
    avgPatina: avgPatinaWisdom, avgPrecision: avgForgePrecision, avgMastery: avgAgedMastery,
    isCopper, overallWarmth,
  }

  const copperMasterpieceCount = panels.filter((p) => p.condition === 'copper-masterpiece').length
  const verdigrisGemCount = panels.filter((p) => p.condition === 'verdigris-gem').length
  const properCopperCount = panels.filter((p) => p.condition === 'proper-copper').length
  const tarnishedMetalCount = panels.filter((p) => p.condition === 'tarnished-metal').length
  const rawOreCount = panels.filter((p) => p.condition === 'raw-ore').length
  const voidCount = panels.filter((p) => p.condition === 'void').length

  const hasHighPatinaCount = panels.filter((p) => p.aging.hasHighPatina).length
  const hasHighGraceCount = panels.filter((p) => p.flowing.hasHighGrace).length
  const hasHighPrecisionCount = panels.filter((p) => p.shaping.hasHighPrecision).length
  const hasHighEnduranceCount = panels.filter((p) => p.warming.hasHighEndurance).length
  const hasHighMasteryCount = panels.filter((p) => p.mastering.hasHighMastery).length

  const architectGrade = classifyArchitectGrade(overallWarmth)

  const bestPanel = panels.length > 0
    ? panels.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file : ''
  const wisest = panels.length > 0
    ? panels.reduce((best, p) => (p.patinaWisdom > best.patinaWisdom ? p : best)).file : ''
  const mostGraceful = panels.length > 0
    ? panels.reduce((best, p) => (p.conductiveGrace > best.conductiveGrace ? p : best)).file : ''
  const mostPrecise = panels.length > 0
    ? panels.reduce((best, p) => (p.forgePrecision > best.forgePrecision ? p : best)).file : ''
  const mostEnduring = panels.length > 0
    ? panels.reduce((best, p) => (p.warmthEndurance > best.warmthEndurance ? p : best)).file : ''
  const mostMasterful = panels.length > 0
    ? panels.reduce((best, p) => (p.agedMastery > best.agedMastery ? p : best)).file : ''

  const stats: CopperCathedralResult['stats'] = {
    totalFiles: files.length, totalSpires: spires.length,
    avgPatinaWisdom, avgConductiveGrace, avgForgePrecision, avgWarmthEndurance, avgAgedMastery,
    copperMasterpieceCount, verdigrisGemCount, properCopperCount, tarnishedMetalCount, rawOreCount, voidCount,
    hasHighPatinaCount, hasHighGraceCount, hasHighPrecisionCount, hasHighEnduranceCount, hasHighMasteryCount,
    overallWarmth, architectGrade,
    bestPanel, wisest, mostGraceful, mostPrecise, mostEnduring, mostMasterful,
  }

  const recommendations = generateRecommendations(panels, spires, nave, stats)

  return {
    panels, spires, nave, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(panels, spires, nave, stats) */
export function generateRecommendations(
  panels: CopperPanel[],
  spires: CopperSpire[],
  nave: CopperCathedralResult['nave'],
  stats: CopperCathedralResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPatinaWisdom >= 90 &&
    stats.avgConductiveGrace >= 90 &&
    stats.avgForgePrecision >= 90 &&
    stats.avgWarmthEndurance >= 90 &&
    stats.avgAgedMastery >= 90
  ) {
    recs.push(
      'Your copper cathedral stands eternal! The patina is noble, the conduction flawless, the forge masterful, the warmth enduring, and the mastery ancient!',
    )
    return recs
  }

  if (stats.avgPatinaWisdom < 60) {
    recs.push(
      'Develop patina wisdom — copper ages with dignity; your code needs mature patterns, proven approaches, and the grace that comes only with time'
    )
  }

  if (stats.avgConductiveGrace < 60) {
    recs.push(
      'Improve conductive grace — copper conducts energy perfectly; your code needs better flow, stronger connections, and seamless integration between modules'
    )
  }

  if (stats.avgForgePrecision < 60) {
    recs.push(
      'Refine forge precision — every copper panel must be perfectly shaped; your code needs stricter types, cleaner definitions, and more exact patterns'
    )
  }

  if (stats.avgWarmthEndurance < 60) {
    recs.push(
      'Strengthen warmth endurance — a cathedral must stand for centuries; your code needs error handling, defensive patterns, and lasting resilience'
    )
  }

  if (stats.avgAgedMastery < 60) {
    recs.push(
      'Deepen aged mastery — the master builder knows every joint; your code needs principled architecture, proven patterns, and profound understanding'
    )
  }

  if (stats.overallWarmth < 40) {
    recs.push(
      'The cathedral crumbles — tarnished metal and raw ore outnumber the precious copper, and the spires stand empty'
    )
  }

  const voidPanels = panels.filter((p) => p.condition === 'void')
  if (voidPanels.length > 0 && voidPanels.length <= 5) {
    recs.push(`Restore these damaged panels: ${voidPanels.map((p) => p.file).join(', ')}`)
  } else if (voidPanels.length > 5) {
    recs.push(`Restore ${voidPanels.length} damaged panels before the cathedral collapses`)
  }

  const poorSpires = spires.filter((s) => s.condition === 'void' || s.condition === 'tin-roof')
  if (poorSpires.length === spires.length && spires.length > 0) {
    recs.push('All spires are tin roofs — the copper cathedral needs grand-cathedral quality panels throughout')
  }

  if (recs.length === 0) {
    recs.push('Your copper cathedral radiates warmth and wisdom — every panel embodies patina, grace, precision, endurance, and mastery')
  }

  return recs
}
