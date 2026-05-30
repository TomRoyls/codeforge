// ─── Interfaces ──────────────────────────────────────────

export interface GuidingMeasure {
  clarity: number
  path: 'illuminated-path' | 'clear-trail' | 'proper-corridor' | 'dark-tunnel' | 'blind-alley' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasNoObfuscated: boolean
  hasDirect: boolean
  hasVisible: boolean
  hasOrganized: boolean
  hasStructured: boolean
  hasFollowable: boolean
  hasUnderstandable: boolean
  hasNavigable: boolean
  hasOpen: boolean
  hasTransparent: boolean
  crypticCount: number
  obfuscatedCount: number
}

export interface AgingMeasure {
  patience: number
  patina: 'ancient-verdigris' | 'aged-copper' | 'proper-patience' | 'rushed-work' | 'hasty-job' | 'no-patience'
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
  hasPatient: boolean
  hasConsidered: boolean
  hasThoughtful: boolean
  undocumentedCount: number
  untestedCount: number
}

export interface WeavingMeasure {
  coherence: number
  twist: 'elegant-spiral' | 'logical-turn' | 'proper-bend' | 'random-zigzag' | 'broken-path' | 'no-coherence'
  hasHighCoherence: boolean
  hasConsistent: boolean
  hasNoContradictory: boolean
  hasLogical: boolean
  hasNoIllogical: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasCoherent: boolean
  hasUniform: boolean
  hasHarmonious: boolean
  hasAligned: boolean
  hasConnected: boolean
  hasFlowing: boolean
  hasReasonable: boolean
  hasSound: boolean
  hasRational: boolean
  contradictoryCount: number
  unsafeCount: number
}

export interface BoundingMeasure {
  resilience: number
  wall: 'impregnable-fortress' | 'strong-boundary' | 'proper-wall' | 'low-fence' | 'no-barrier' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTypeSafe: boolean
  hasBoundaried: boolean
  hasEncapsulated: boolean
  hasProtected: boolean
  hasShielded: boolean
  hasGuarded: boolean
  hasContained: boolean
  hasIsolated: boolean
  hasValidated: boolean
  hasSafe: boolean
  hasSecure: boolean
  unhandledCount: number
  exposedCount: number
}

export interface DeepeningMeasure {
  wisdom: number
  center: 'oracle-core' | 'wise-center' | 'proper-middle' | 'hollow-core' | 'empty-center' | 'no-wisdom'
  hasHighWisdom: boolean
  hasWellArchitected: boolean
  hasNoHacked: boolean
  hasPrincipled: boolean
  hasDeep: boolean
  hasProven: boolean
  hasInsightful: boolean
  hasStrategic: boolean
  hasMature: boolean
  hasProfound: boolean
  hasEvolved: boolean
  hasReflective: boolean
  hasComprehensive: boolean
  hasLayered: boolean
  hasWise: boolean
  hasAccumulated: boolean
  hackedCount: number
  shallowCount: number
}

export type CopperCondition =
  | 'labyrinth-masterpiece'
  | 'ancient-maze'
  | 'proper-path'
  | 'crumbling-wall'
  | 'collapsed-tunnel'
  | 'void'

export interface CopperPath {
  file: string
  pathClarity: number
  copperPatience: number
  twistCoherence: number
  wallResilience: number
  centerWisdom: number
  guiding: GuidingMeasure
  aging: AgingMeasure
  weaving: WeavingMeasure
  bounding: BoundingMeasure
  deepening: DeepeningMeasure
  condition: CopperCondition
  qualityScore: number
}

export type MazeType =
  | 'sacred-labyrinth'
  | 'copper-maze'
  | 'proper-path'
  | 'garden-hedge'
  | 'open-field'
  | 'no-maze'

export type MazeCondition =
  | 'copper-palace'
  | 'aged-sanctuary'
  | 'proper-hall'
  | 'crumbling-corridor'
  | 'rubble'
  | 'void'

export interface CopperMaze {
  directory: string
  paths: CopperPath[]
  avgClarity: number
  avgCoherence: number
  avgWisdom: number
  labyrinthMasterpieceCount: number
  voidCount: number
  mazeType: MazeType
  condition: MazeCondition
}

export type NavigatorGrade = 'labyrinth-master' | 'maze-walker' | 'path-finder' | 'apprentice' | 'novice' | 'lost-soul'

export interface CopperLabyrinthResult {
  paths: CopperPath[]
  mazes: CopperMaze[]
  labyrinth: {
    avgClarity: number
    avgCoherence: number
    avgWisdom: number
    isCopper: boolean
    overallNavigation: number
  }
  stats: {
    totalFiles: number
    totalMazes: number
    avgPathClarity: number
    avgCopperPatience: number
    avgTwistCoherence: number
    avgWallResilience: number
    avgCenterWisdom: number
    labyrinthMasterpieceCount: number
    ancientMazeCount: number
    properPathCount: number
    crumblingWallCount: number
    collapsedTunnelCount: number
    voidCount: number
    hasHighClarityCount: number
    hasHighPatienceCount: number
    hasHighCoherenceCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallNavigation: number
    navigatorGrade: NavigatorGrade
    bestPath: string
    clearest: string
    mostPatient: string
    mostCoherent: string
    mostResilient: string
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

/** @example classifyCopperCondition(90) */
export function classifyCopperCondition(score: number): CopperCondition {
  if (score >= 90) return 'labyrinth-masterpiece'
  if (score >= 75) return 'ancient-maze'
  if (score >= 60) return 'proper-path'
  if (score >= 40) return 'crumbling-wall'
  if (score >= 20) return 'collapsed-tunnel'
  return 'void'
}

/** @example classifyMazeType(paths) */
export function classifyMazeType(paths: CopperPath[]): MazeType {
  if (paths.length === 0) return 'no-maze'
  const avg = paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length
  if (avg >= 85) return 'sacred-labyrinth'
  if (avg >= 70) return 'copper-maze'
  if (avg >= 55) return 'proper-path'
  if (avg >= 35) return 'garden-hedge'
  return 'open-field'
}

/** @example classifyMazeCondition(85) */
export function classifyMazeCondition(score: number): MazeCondition {
  if (score >= 85) return 'copper-palace'
  if (score >= 70) return 'aged-sanctuary'
  if (score >= 55) return 'proper-hall'
  if (score >= 35) return 'crumbling-corridor'
  if (score >= 15) return 'rubble'
  return 'void'
}

/** @example classifyNavigatorGrade(80) */
export function classifyNavigatorGrade(avgNavigation: number): NavigatorGrade {
  if (avgNavigation >= 80) return 'labyrinth-master'
  if (avgNavigation >= 65) return 'maze-walker'
  if (avgNavigation >= 50) return 'path-finder'
  if (avgNavigation >= 35) return 'apprentice'
  if (avgNavigation >= 20) return 'novice'
  return 'lost-soul'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureGuiding('class X { readonly y: string }') */
export function measureGuiding(content: string): GuidingMeasure {
  const hasReadable = /\b(class|interface|type)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|obfuscate|minified)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasNoMystery = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasClear = !/\bany\b/.test(content)
  const obfuscatedCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoObfuscated = obfuscatedCount === 0
  const hasDirect = /\b(function|=>|return)\b/.test(content)
  const hasVisible = /\b(readonly|private|protected)\b/.test(content)
  const hasOrganized = /\b(import|export)\b/.test(content)
  const hasStructured = /\b(class|interface|type)\b/.test(content)
  const hasFollowable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnderstandable = /\b(async|await|Promise)\b/.test(content)
  const hasNavigable = /\b(try|catch|if)\b/.test(content)
  const hasOpen = /\b(const|readonly)\b/.test(content)
  const hasTransparent = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasDirect, hasVisible, hasOrganized, hasStructured,
    hasFollowable, hasUnderstandable, hasNavigable, hasOpen, hasTransparent,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let path: GuidingMeasure['path'] = 'no-clarity'
  if (clarity >= 90) path = 'illuminated-path'
  else if (clarity >= 75) path = 'clear-trail'
  else if (clarity >= 60) path = 'proper-corridor'
  else if (clarity >= 40) path = 'dark-tunnel'
  else if (clarity >= 20) path = 'blind-alley'

  return {
    clarity, path, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasNoObfuscated, hasDirect, hasVisible, hasOrganized, hasStructured,
    hasFollowable, hasUnderstandable, hasNavigable, hasOpen, hasTransparent,
    crypticCount, obfuscatedCount,
  }
}

/** @example measureAging('export class X { readonly y: string }') */
export function measureAging(content: string): AgingMeasure {
  const hasWellStructured = /\b(class|interface|type)\b/.test(content)
  const chaoticCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoChaotic = chaoticCount === 0
  const hasDocumented = /\/\*\*[\s\S]*?\*\//.test(content)
  const undocumentedCount = 0
  const hasNoUndocumented = true
  const hasTested = /\b(try|catch|if)\b/.test(content)
  const untestedCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasProven = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasMature = !/\bany\b/.test(content)
  const hasRefined = /\b(readonly|private|protected)\b/.test(content)
  const hasDeliberate = /\b(import|export)\b/.test(content)
  const hasCareful = /\b(async|await|Promise)\b/.test(content)
  const hasThorough = /\b(function|=>|return)\b/.test(content)
  const hasPatient = /\b(const|readonly)\b/.test(content)
  const hasConsidered = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasThoughtful = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasWellStructured, hasNoChaotic, hasDocumented, hasNoUndocumented, hasTested,
    hasNoUntested, hasProven, hasMature, hasRefined, hasDeliberate,
    hasCareful, hasThorough, hasPatient, hasConsidered, hasThoughtful,
  ]

  const patience = computeScore(positiveBooleans)
  const hasHighPatience = patience >= 60

  let patina: AgingMeasure['patina'] = 'no-patience'
  if (patience >= 90) patina = 'ancient-verdigris'
  else if (patience >= 75) patina = 'aged-copper'
  else if (patience >= 60) patina = 'proper-patience'
  else if (patience >= 40) patina = 'rushed-work'
  else if (patience >= 20) patina = 'hasty-job'

  return {
    patience, patina, hasHighPatience,
    hasWellStructured, hasNoChaotic, hasDocumented, hasNoUndocumented, hasTested,
    hasNoUntested, hasProven, hasMature, hasRefined, hasDeliberate,
    hasCareful, hasThorough, hasPatient, hasConsidered, hasThoughtful,
    undocumentedCount, untestedCount,
  }
}

/** @example measureWeaving('try { x } catch { y }') */
export function measureWeaving(content: string): WeavingMeasure {
  const hasConsistent = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const contradictoryCount = (content.match(/\b(contradictory|inconsistent|paradox)\b/gi) ?? []).length
  const hasNoContradictory = contradictoryCount === 0
  const hasLogical = /\b(class|interface|type)\b/.test(content)
  const hasNoIllogical = !/\bany\b/.test(content)
  const hasTypeSafe = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const unsafeCount = (content.match(/\b(unsafe|any)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasCoherent = /\b(import|export)\b/.test(content)
  const hasUniform = /\b(readonly|private|protected)\b/.test(content)
  const hasHarmonious = /\b(const|readonly)\b/.test(content)
  const hasAligned = /\b(try|catch|if)\b/.test(content)
  const hasConnected = /\b(async|await|Promise)\b/.test(content)
  const hasFlowing = /\b(function|=>|return)\b/.test(content)
  const hasReasonable = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasSound = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasRational = (content.match(/\b(var|eval)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasConsistent, hasNoContradictory, hasLogical, hasNoIllogical, hasTypeSafe,
    hasNoUnsafe, hasCoherent, hasUniform, hasHarmonious, hasAligned,
    hasConnected, hasFlowing, hasReasonable, hasSound, hasRational,
  ]

  const coherence = computeScore(positiveBooleans)
  const hasHighCoherence = coherence >= 60

  let twist: WeavingMeasure['twist'] = 'no-coherence'
  if (coherence >= 90) twist = 'elegant-spiral'
  else if (coherence >= 75) twist = 'logical-turn'
  else if (coherence >= 60) twist = 'proper-bend'
  else if (coherence >= 40) twist = 'random-zigzag'
  else if (coherence >= 20) twist = 'broken-path'

  return {
    coherence, twist, hasHighCoherence,
    hasConsistent, hasNoContradictory, hasLogical, hasNoIllogical, hasTypeSafe,
    hasNoUnsafe, hasCoherent, hasUniform, hasHarmonious, hasAligned,
    hasConnected, hasFlowing, hasReasonable, hasSound, hasRational,
    contradictoryCount, unsafeCount,
  }
}

/** @example measureBounding('try { x } catch { y }') */
export function measureBounding(content: string): BoundingMeasure {
  const hasErrorHandled = /\b(try|catch|if)\b/.test(content)
  const unhandledCount = (content.match(/\b(eval|Function)\b/g) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasRobust = !/\bany\b/.test(content)
  const hasTypeSafe = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasBoundaried = /\b(readonly|private|protected)\b/.test(content)
  const hasEncapsulated = /\b(class|interface|type)\b/.test(content)
  const hasProtected = /\b(const|readonly)\b/.test(content)
  const hasShielded = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasGuarded = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasContained = /\b(import|export)\b/.test(content)
  const hasIsolated = /\b(async|await|Promise)\b/.test(content)
  const hasValidated = /\b(try|catch|if)\b/.test(content)
  const hasSafe = /\/\*\*[\s\S]*?\*\//.test(content)
  const exposedCount = (content.match(/\b(exposed|leaky|unprotected)\b/gi) ?? []).length
  const hasSecure = /\b(function|=>|return)\b/.test(content)

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTypeSafe,
    hasBoundaried, hasEncapsulated, hasProtected, hasShielded, hasGuarded,
    hasContained, hasIsolated, hasValidated, hasSafe, hasSecure,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let wall: BoundingMeasure['wall'] = 'no-resilience'
  if (resilience >= 90) wall = 'impregnable-fortress'
  else if (resilience >= 75) wall = 'strong-boundary'
  else if (resilience >= 60) wall = 'proper-wall'
  else if (resilience >= 40) wall = 'low-fence'
  else if (resilience >= 20) wall = 'no-barrier'

  return {
    resilience, wall, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTypeSafe,
    hasBoundaried, hasEncapsulated, hasProtected, hasShielded, hasGuarded,
    hasContained, hasIsolated, hasValidated, hasSafe, hasSecure,
    unhandledCount, exposedCount,
  }
}

/** @example measureDeepening('export class X { readonly y: string }') */
export function measureDeepening(content: string): DeepeningMeasure {
  const hasWellArchitected = /\b(class|interface|type)\b/.test(content)
  const hackedCount = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length
  const hasNoHacked = hackedCount === 0
  const hasPrincipled = !/\bany\b/.test(content)
  const hasDeep = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasProven = /\b(try|catch|if)\b/.test(content)
  const hasInsightful = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasStrategic = /\b(import|export)\b/.test(content)
  const hasMature = /\b(readonly|private|protected)\b/.test(content)
  const hasProfound = /\b(async|await|Promise)\b/.test(content)
  const hasEvolved = /\b(function|=>|return)\b/.test(content)
  const hasReflective = /\b(const|readonly)\b/.test(content)
  const hasComprehensive = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasLayered = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasAccumulated = /\b(throw|return)\b/.test(content)
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasInsightful, hasStrategic, hasMature, hasProfound, hasEvolved,
    hasReflective, hasComprehensive, hasLayered, hasWise, hasAccumulated,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let center: DeepeningMeasure['center'] = 'no-wisdom'
  if (wisdom >= 90) center = 'oracle-core'
  else if (wisdom >= 75) center = 'wise-center'
  else if (wisdom >= 60) center = 'proper-middle'
  else if (wisdom >= 40) center = 'hollow-core'
  else if (wisdom >= 20) center = 'empty-center'

  return {
    wisdom, center, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasProven,
    hasInsightful, hasStrategic, hasMature, hasProfound, hasEvolved,
    hasReflective, hasComprehensive, hasLayered, hasWise, hasAccumulated,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeCopperPath(content, 'app.ts') */
export function analyzeCopperPath(content: string, filePath: string): CopperPath {
  const guiding = measureGuiding(content)
  const aging = measureAging(content)
  const weaving = measureWeaving(content)
  const bounding = measureBounding(content)
  const deepening = measureDeepening(content)

  const pathClarity = guiding.clarity
  const copperPatience = aging.patience
  const twistCoherence = weaving.coherence
  const wallResilience = bounding.resilience
  const centerWisdom = deepening.wisdom

  const qualityScore = Math.round(
    pathClarity * 0.2 +
    copperPatience * 0.2 +
    twistCoherence * 0.2 +
    wallResilience * 0.2 +
    centerWisdom * 0.2,
  )

  const condition = classifyCopperCondition(qualityScore)

  return {
    file: filePath,
    pathClarity, copperPatience, twistCoherence, wallResilience, centerWisdom,
    guiding, aging, weaving, bounding, deepening,
    condition, qualityScore,
  }
}

/** @example analyzeCopperMaze(paths, 'src') */
export function analyzeCopperMaze(paths: CopperPath[], dirPath: string): CopperMaze {
  if (paths.length === 0) {
    return {
      directory: dirPath, paths: [],
      avgClarity: 0, avgCoherence: 0, avgWisdom: 0,
      labyrinthMasterpieceCount: 0, voidCount: 0,
      mazeType: 'no-maze', condition: 'void',
    }
  }

  const avgClarity = Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length)
  const avgCoherence = Math.round(paths.reduce((s, p) => s + p.twistCoherence, 0) / paths.length)
  const avgWisdom = Math.round(paths.reduce((s, p) => s + p.centerWisdom, 0) / paths.length)
  const labyrinthMasterpieceCount = paths.filter((p) => p.condition === 'labyrinth-masterpiece').length
  const voidCount = paths.filter((p) => p.condition === 'void').length
  const mazeType = classifyMazeType(paths)
  const avgQuality = Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length)
  const condition = classifyMazeCondition(avgQuality)

  return {
    directory: dirPath, paths,
    avgClarity, avgCoherence, avgWisdom,
    labyrinthMasterpieceCount, voidCount,
    mazeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildCopperLabyrinthResult(['a.ts'], [content]) */
export async function buildCopperLabyrinthResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<CopperLabyrinthResult> {
  const paths: CopperPath[] = files.map((file, i) =>
    analyzeCopperPath(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, CopperPath[]>()
  for (const path of paths) {
    const dir = path.file.includes('/')
      ? path.file.substring(0, path.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(path)
    } else {
      dirMap.set(dir, [path])
    }
  }

  const mazes: CopperMaze[] = Array.from(dirMap.entries()).map(([dir, dirPaths]) =>
    analyzeCopperMaze(dirPaths, dir),
  )

  const avgPathClarity = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.pathClarity, 0) / paths.length) : 0
  const avgCopperPatience = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.copperPatience, 0) / paths.length) : 0
  const avgTwistCoherence = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.twistCoherence, 0) / paths.length) : 0
  const avgWallResilience = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.wallResilience, 0) / paths.length) : 0
  const avgCenterWisdom = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.centerWisdom, 0) / paths.length) : 0

  const overallNavigation = paths.length > 0
    ? Math.round(paths.reduce((s, p) => s + p.qualityScore, 0) / paths.length) : 0
  const isCopper = overallNavigation >= 60

  const labyrinth = { avgClarity: avgPathClarity, avgCoherence: avgTwistCoherence, avgWisdom: avgCenterWisdom, isCopper, overallNavigation }

  const labyrinthMasterpieceCount = paths.filter((p) => p.condition === 'labyrinth-masterpiece').length
  const ancientMazeCount = paths.filter((p) => p.condition === 'ancient-maze').length
  const properPathCount = paths.filter((p) => p.condition === 'proper-path').length
  const crumblingWallCount = paths.filter((p) => p.condition === 'crumbling-wall').length
  const collapsedTunnelCount = paths.filter((p) => p.condition === 'collapsed-tunnel').length
  const voidCount = paths.filter((p) => p.condition === 'void').length

  const hasHighClarityCount = paths.filter((p) => p.guiding.hasHighClarity).length
  const hasHighPatienceCount = paths.filter((p) => p.aging.hasHighPatience).length
  const hasHighCoherenceCount = paths.filter((p) => p.weaving.hasHighCoherence).length
  const hasHighResilienceCount = paths.filter((p) => p.bounding.hasHighResilience).length
  const hasHighWisdomCount = paths.filter((p) => p.deepening.hasHighWisdom).length

  const navigatorGrade = classifyNavigatorGrade(overallNavigation)

  const bestPath = paths.length > 0
    ? paths.reduce((best, p) => (p.qualityScore > best.qualityScore ? p : best)).file : ''
  const clearest = paths.length > 0
    ? paths.reduce((best, p) => (p.pathClarity > best.pathClarity ? p : best)).file : ''
  const mostPatient = paths.length > 0
    ? paths.reduce((best, p) => (p.copperPatience > best.copperPatience ? p : best)).file : ''
  const mostCoherent = paths.length > 0
    ? paths.reduce((best, p) => (p.twistCoherence > best.twistCoherence ? p : best)).file : ''
  const mostResilient = paths.length > 0
    ? paths.reduce((best, p) => (p.wallResilience > best.wallResilience ? p : best)).file : ''
  const wisest = paths.length > 0
    ? paths.reduce((best, p) => (p.centerWisdom > best.centerWisdom ? p : best)).file : ''

  const stats: CopperLabyrinthResult['stats'] = {
    totalFiles: files.length, totalMazes: mazes.length,
    avgPathClarity, avgCopperPatience, avgTwistCoherence, avgWallResilience, avgCenterWisdom,
    labyrinthMasterpieceCount, ancientMazeCount, properPathCount, crumblingWallCount, collapsedTunnelCount, voidCount,
    hasHighClarityCount, hasHighPatienceCount, hasHighCoherenceCount, hasHighResilienceCount, hasHighWisdomCount,
    overallNavigation, navigatorGrade,
    bestPath, clearest, mostPatient, mostCoherent, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(paths, mazes, labyrinth, stats)

  return { paths, mazes, labyrinth, stats, recommendations }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(paths, mazes, labyrinth, stats) */
export function generateRecommendations(
  paths: CopperPath[],
  mazes: CopperMaze[],
  _labyrinth: CopperLabyrinthResult['labyrinth'],
  stats: CopperLabyrinthResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgPathClarity >= 90 &&
    stats.avgCopperPatience >= 90 &&
    stats.avgTwistCoherence >= 90 &&
    stats.avgWallResilience >= 90 &&
    stats.avgCenterWisdom >= 90
  ) {
    recs.push(
      'Your copper labyrinth is a masterpiece of ancient craft! Every path combines clarity, patience, coherence, resilience, and wisdom into a navigable work of art!',
    )
    return recs
  }

  if (stats.avgPathClarity < 60) {
    recs.push(
      'Illuminate the paths — a labyrinth should guide, not confuse; your code needs clearer direction, better naming, and more transparent flow',
    )
  }

  if (stats.avgCopperPatience < 60) {
    recs.push(
      'Develop copper patience — great patina takes years; your code should be well-tested, documented, and deliberately crafted over time',
    )
  }

  if (stats.avgTwistCoherence < 60) {
    recs.push(
      'Strengthen twist coherence — even labyrinth turns follow a pattern; your code should be logically consistent, type-safe, and coherent throughout',
    )
  }

  if (stats.avgWallResilience < 60) {
    recs.push(
      'Reinforce the walls — labyrinth walls keep wanderers safe; your code needs stronger error handling, better boundaries, and defensive programming',
    )
  }

  if (stats.avgCenterWisdom < 60) {
    recs.push(
      'Deepen center wisdom — the labyrinth center holds the deepest insight; your code should be well-architected, principled, and built on accumulated experience',
    )
  }

  if (stats.overallNavigation < 40) {
    recs.push(
      'The labyrinth has collapsed — no path leads anywhere and the copper walls have crumbled to dust',
    )
  }

  const voidPaths = paths.filter((p) => p.condition === 'void')
  if (voidPaths.length > 0 && voidPaths.length <= 5) {
    recs.push(`Clear these blocked paths: ${voidPaths.map((p) => p.file).join(', ')}`)
  } else if (voidPaths.length > 5) {
    recs.push(`Clear ${voidPaths.length} blocked paths before the labyrinth becomes unnavigable`)
  }

  const poorMazes = mazes.filter((m) => m.condition === 'void' || m.condition === 'rubble')
  if (poorMazes.length === mazes.length && mazes.length > 0) {
    recs.push('All maze sections have collapsed — the copper labyrinth needs a complete reconstruction from foundation to spire')
  }

  if (recs.length === 0) {
    recs.push('Your copper labyrinth navigates well — each path combines clarity, patience, coherence, resilience, and center wisdom')
  }

  return recs
}
