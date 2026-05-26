// ─── Interfaces ──────────────────────────────────────────

export interface MirroringMeasure {
  purity: number
  reflection: 'perfect-mirror' | 'silver-glass' | 'proper-reflection' | 'tarnished-silver' | 'dark-metal' | 'no-purity'
  hasHighPurity: boolean
  hasClean: boolean
  hasNoHack: boolean
  hasNoWorkaround: boolean
  hasNoTodo: boolean
  hasNoCommentedOut: boolean
  hasNoDebugCode: boolean
  hasPristine: boolean
  hasSpotless: boolean
  hasImmaculate: boolean
  hasPure: boolean
  hasUnblemished: boolean
  hasUntarnished: boolean
  hasUnpolluted: boolean
  hasFlawless: boolean
  hasUnadulterated: boolean
  hackCount: number
  workaroundCount: number
}

export interface GuidingMeasure {
  clarity: number
  path: 'golden-thread' | 'clear-corridor' | 'proper-hallway' | 'dim-passage' | 'dark-tunnel' | 'no-clarity'
  hasHighClarity: boolean
  hasReadable: boolean
  hasNoCryptic: boolean
  hasSelfDocumenting: boolean
  hasNoMystery: boolean
  hasClear: boolean
  hasUnderstandable: boolean
  hasNavigable: boolean
  hasOrganized: boolean
  hasLogical: boolean
  hasCoherent: boolean
  hasFlowing: boolean
  hasDirect: boolean
  hasStraightforward: boolean
  hasUnambiguous: boolean
  hasObvious: boolean
  crypticCount: number
  mysteryCount: number
}

export interface ConstructingMeasure {
  precision: number
  craft: 'architectural-perfection' | 'master-builder' | 'proper-construction' | 'rough-mortar' | 'crumbling-wall' | 'no-precision'
  hasHighPrecision: boolean
  hasTypeSafe: boolean
  hasNoUnsafe: boolean
  hasAccurate: boolean
  hasNoApproximate: boolean
  hasExact: boolean
  hasPrecise: boolean
  hasSharp: boolean
  hasCrisp: boolean
  hasDefined: boolean
  hasClean: boolean
  hasCorrect: boolean
  hasMeasured: boolean
  hasCalculated: boolean
  hasGeometric: boolean
  hasSymmetrical: boolean
  unsafeCount: number
  approximateCount: number
}

export interface DefendingMeasure {
  resilience: number
  fortification: 'impregnable-wall' | 'strong-fortress' | 'proper-defense' | 'wooden-palisade' | 'paper-fence' | 'no-resilience'
  hasHighResilience: boolean
  hasErrorHandled: boolean
  hasNoUnhandled: boolean
  hasDefensive: boolean
  hasRobust: boolean
  hasTested: boolean
  hasNoUntested: boolean
  hasSecure: boolean
  hasHardened: boolean
  hasFortified: boolean
  hasReinforced: boolean
  hasShielded: boolean
  hasProtected: boolean
  hasGuarded: boolean
  hasArmored: boolean
  unhandledCount: number
  untestedCount: number
}

export interface UnderstandingMeasure {
  wisdom: number
  center: 'labyrinth-core' | 'deep-center' | 'proper-middle' | 'shallow-heart' | 'no-center' | 'no-wisdom'
  hasHighWisdom: boolean
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
  hasPurposeful: boolean
  hasWise: boolean
  hasProfound: boolean
  hackedCount: number
  shallowCount: number
}

export type SilverCondition =
  | 'silver-masterpiece'
  | 'mirror-labyrinth'
  | 'proper-silver'
  | 'tarnished-metal'
  | 'rusty-iron'
  | 'void'

export interface SilverCorridor {
  file: string
  reflectivePurity: number
  pathClarity: number
  mazePrecision: number
  wallResilience: number
  centerWisdom: number
  mirroring: MirroringMeasure
  guiding: GuidingMeasure
  constructing: ConstructingMeasure
  defending: DefendingMeasure
  understanding: UnderstandingMeasure
  condition: SilverCondition
  qualityScore: number
}

export type MazeType =
  | 'grand-labyrinth'
  | 'silver-palace'
  | 'proper-maze'
  | 'simple-path'
  | 'dead-end'
  | 'no-maze'

export type MazeCondition =
  | 'mirror-palace'
  | 'silver-hall'
  | 'proper-corridor'
  | 'stone-passage'
  | 'dirt-tunnel'
  | 'void'

export interface SilverMaze {
  directory: string
  corridors: SilverCorridor[]
  avgPurity: number
  avgPrecision: number
  avgWisdom: number
  silverMasterpieceCount: number
  voidCount: number
  mazeType: MazeType
  condition: MazeCondition
}

export type NavigatorGrade = 'labyrinth-master' | 'silver-guide' | 'proper-navigator' | 'lost-traveler' | 'novice' | 'wanderer'

export interface SilverLabyrinthResult {
  corridors: SilverCorridor[]
  mazes: SilverMaze[]
  labyrinth: {
    avgPurity: number
    avgPrecision: number
    avgWisdom: number
    isSilver: boolean
    overallReflection: number
  }
  stats: {
    totalFiles: number
    totalMazes: number
    avgReflectivePurity: number
    avgPathClarity: number
    avgMazePrecision: number
    avgWallResilience: number
    avgCenterWisdom: number
    silverMasterpieceCount: number
    mirrorLabyrinthCount: number
    properSilverCount: number
    tarnishedMetalCount: number
    rustyIronCount: number
    voidCount: number
    hasHighPurityCount: number
    hasHighClarityCount: number
    hasHighPrecisionCount: number
    hasHighResilienceCount: number
    hasHighWisdomCount: number
    overallReflection: number
    navigatorGrade: NavigatorGrade
    bestCorridor: string
    purest: string
    clearest: string
    mostPrecise: string
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

/** @example classifySilverCondition(90) */
export function classifySilverCondition(score: number): SilverCondition {
  if (score >= 90) return 'silver-masterpiece'
  if (score >= 75) return 'mirror-labyrinth'
  if (score >= 60) return 'proper-silver'
  if (score >= 40) return 'tarnished-metal'
  if (score >= 20) return 'rusty-iron'
  return 'void'
}

/** @example classifyMazeType(corridors) */
export function classifyMazeType(corridors: SilverCorridor[]): MazeType {
  if (corridors.length === 0) return 'no-maze'
  const avg = corridors.reduce((s, c) => s + c.qualityScore, 0) / corridors.length
  if (avg >= 85) return 'grand-labyrinth'
  if (avg >= 70) return 'silver-palace'
  if (avg >= 55) return 'proper-maze'
  if (avg >= 35) return 'simple-path'
  return 'dead-end'
}

/** @example classifyMazeCondition(85) */
export function classifyMazeCondition(score: number): MazeCondition {
  if (score >= 85) return 'mirror-palace'
  if (score >= 70) return 'silver-hall'
  if (score >= 55) return 'proper-corridor'
  if (score >= 35) return 'stone-passage'
  if (score >= 15) return 'dirt-tunnel'
  return 'void'
}

/** @example classifyNavigatorGrade(80) */
export function classifyNavigatorGrade(avgReflection: number): NavigatorGrade {
  if (avgReflection >= 80) return 'labyrinth-master'
  if (avgReflection >= 65) return 'silver-guide'
  if (avgReflection >= 50) return 'proper-navigator'
  if (avgReflection >= 35) return 'lost-traveler'
  if (avgReflection >= 20) return 'novice'
  return 'wanderer'
}

// ─── Measure functions ──────────────────────────────────

/** @example measureMirroring('export class X { readonly y: string }') */
export function measureMirroring(content: string): MirroringMeasure {
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hackCount = (content.match(/\b(hack|kludge)\b/gi) ?? []).length
  const hasNoHack = hackCount === 0
  const workaroundCount = (content.match(/\b(workaround|bypass)\b/gi) ?? []).length
  const hasNoWorkaround = workaroundCount === 0
  const hasNoTodo = (content.match(/\b(todo|fixme|xxx)\b/gi) ?? []).length === 0
  const hasNoCommentedOut = (content.match(/\/\/\s*(const|let|var|import|export)\b/g) ?? []).length === 0
  const hasNoDebugCode = (content.match(/\b(console\.(log|debug|info|warn|error))\b/g) ?? []).length === 0
  const hasPristine = /\b(class|interface|type)\b/.test(content)
  const hasSpotless = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasImmaculate = /\b(readonly|private|protected)\b/.test(content)
  const hasPure = !/\bany\b/.test(content)
  const hasUnblemished = /\b(import|export)\b/.test(content)
  const hasUntarnished = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasUnpolluted = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasFlawless = /\b(try|catch)\b/.test(content)
  const hasUnadulterated = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasPristine, hasSpotless, hasImmaculate, hasPure,
    hasUnblemished, hasUntarnished, hasUnpolluted, hasFlawless, hasUnadulterated,
  ]

  const purity = computeScore(positiveBooleans)
  const hasHighPurity = purity >= 60

  let reflection: MirroringMeasure['reflection'] = 'no-purity'
  if (purity >= 90) reflection = 'perfect-mirror'
  else if (purity >= 75) reflection = 'silver-glass'
  else if (purity >= 60) reflection = 'proper-reflection'
  else if (purity >= 40) reflection = 'tarnished-silver'
  else if (purity >= 20) reflection = 'dark-metal'

  return {
    purity, reflection, hasHighPurity,
    hasClean, hasNoHack, hasNoWorkaround, hasNoTodo, hasNoCommentedOut,
    hasNoDebugCode, hasPristine, hasSpotless, hasImmaculate, hasPure,
    hasUnblemished, hasUntarnished, hasUnpolluted, hasFlawless, hasUnadulterated,
    hackCount, workaroundCount,
  }
}

/** @example measureGuiding('export class X { readonly y: string }') */
export function measureGuiding(content: string): GuidingMeasure {
  const hasReadable = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const crypticCount = (content.match(/\b(cryptic|mysterious|obscure|enigmatic)\b/gi) ?? []).length
  const hasNoCryptic = crypticCount === 0
  const hasSelfDocumenting = /\b(class|interface|type)\b/.test(content)
  const mysteryCount = (content.match(/\b(mystery|enigma|riddle|puzzle)\b/gi) ?? []).length
  const hasNoMystery = mysteryCount === 0
  const hasClear = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasUnderstandable = /\b(import|export)\b/.test(content)
  const hasNavigable = /\b(function|=>|return)\b/.test(content)
  const hasOrganized = /\b(readonly|private|protected)\b/.test(content)
  const hasLogical = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasCoherent = !/\bany\b/.test(content)
  const hasFlowing = /\b(try|catch|if)\b/.test(content)
  const hasDirect = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasStraightforward = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasUnambiguous = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasObvious = /\b(async|await|Promise)\b/.test(content)

  const positiveBooleans = [
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasUnderstandable, hasNavigable, hasOrganized, hasLogical, hasCoherent,
    hasFlowing, hasDirect, hasStraightforward, hasUnambiguous, hasObvious,
  ]

  const clarity = computeScore(positiveBooleans)
  const hasHighClarity = clarity >= 60

  let path: GuidingMeasure['path'] = 'no-clarity'
  if (clarity >= 90) path = 'golden-thread'
  else if (clarity >= 75) path = 'clear-corridor'
  else if (clarity >= 60) path = 'proper-hallway'
  else if (clarity >= 40) path = 'dim-passage'
  else if (clarity >= 20) path = 'dark-tunnel'

  return {
    clarity, path, hasHighClarity,
    hasReadable, hasNoCryptic, hasSelfDocumenting, hasNoMystery, hasClear,
    hasUnderstandable, hasNavigable, hasOrganized, hasLogical, hasCoherent,
    hasFlowing, hasDirect, hasStraightforward, hasUnambiguous, hasObvious,
    crypticCount, mysteryCount,
  }
}

/** @example measureConstructing('export class X { readonly y: string }') */
export function measureConstructing(content: string): ConstructingMeasure {
  const hasTypeSafe = !/\bany\b/.test(content)
  const unsafeCount = (content.match(/\b(var|eval)\b/g) ?? []).length
  const hasNoUnsafe = unsafeCount === 0
  const hasAccurate = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const approximateCount = (content.match(/\b(approximate|rough|vague|imprecise)\b/gi) ?? []).length
  const hasNoApproximate = approximateCount === 0
  const hasExact = /\b(class|interface|type)\b/.test(content)
  const hasPrecise = /\b(readonly|private|protected)\b/.test(content)
  const hasSharp = /\b(import|export)\b/.test(content)
  const hasCrisp = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasDefined = /\b(function|=>|return)\b/.test(content)
  const hasClean = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasCorrect = (content.match(/\b(monolithic|god\.object|mega)\b/gi) ?? []).length === 0
  const hasMeasured = /\b(try|catch|if)\b/.test(content)
  const hasCalculated = /\b(async|await|Promise)\b/.test(content)
  const hasGeometric = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0
  const hasSymmetrical = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasMeasured, hasCalculated, hasGeometric, hasSymmetrical,
  ]

  const precision = computeScore(positiveBooleans)
  const hasHighPrecision = precision >= 60

  let craft: ConstructingMeasure['craft'] = 'no-precision'
  if (precision >= 90) craft = 'architectural-perfection'
  else if (precision >= 75) craft = 'master-builder'
  else if (precision >= 60) craft = 'proper-construction'
  else if (precision >= 40) craft = 'rough-mortar'
  else if (precision >= 20) craft = 'crumbling-wall'

  return {
    precision, craft, hasHighPrecision,
    hasTypeSafe, hasNoUnsafe, hasAccurate, hasNoApproximate, hasExact,
    hasPrecise, hasSharp, hasCrisp, hasDefined, hasClean,
    hasCorrect, hasMeasured, hasCalculated, hasGeometric, hasSymmetrical,
    unsafeCount, approximateCount,
  }
}

/** @example measureDefending('export class X { readonly y: string }') */
export function measureDefending(content: string): DefendingMeasure {
  const hasErrorHandled = /\b(try|catch)\b/.test(content)
  const unhandledCount = (content.match(/\b(unhandled|uncaught|bare-throw|raw-error)\b/gi) ?? []).length
  const hasNoUnhandled = unhandledCount === 0
  const hasDefensive = /\b(if|return)\b/.test(content)
  const hasRobust = /\b(import|export)\b/.test(content)
  const hasTested = /\b(try|catch)\b/.test(content)
  const untestedCount = (content.match(/\b(untested|unverified|unchecked|unvalidated)\b/gi) ?? []).length
  const hasNoUntested = untestedCount === 0
  const hasSecure = !/\bany\b/.test(content)
  const hasHardened = /\b(readonly|private|protected)\b/.test(content)
  const hasFortified = /:\s*(string|number|boolean|void|unknown|never)\b/.test(content)
  const hasReinforced = /\b(class|interface|type)\b/.test(content)
  const hasShielded = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasProtected = /\/\*\*[\s\S]*?\*\//.test(content)
  const hasGuarded = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasArmored = (content.match(/\b(global|window|document)\b/g) ?? []).length === 0

  const positiveBooleans = [
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasSecure, hasHardened, hasFortified, hasReinforced,
    hasShielded, hasProtected, hasGuarded, hasArmored,
  ]

  const resilience = computeScore(positiveBooleans)
  const hasHighResilience = resilience >= 60

  let fortification: DefendingMeasure['fortification'] = 'no-resilience'
  if (resilience >= 90) fortification = 'impregnable-wall'
  else if (resilience >= 75) fortification = 'strong-fortress'
  else if (resilience >= 60) fortification = 'proper-defense'
  else if (resilience >= 40) fortification = 'wooden-palisade'
  else if (resilience >= 20) fortification = 'paper-fence'

  return {
    resilience, fortification, hasHighResilience,
    hasErrorHandled, hasNoUnhandled, hasDefensive, hasRobust, hasTested,
    hasNoUntested, hasSecure, hasHardened, hasFortified, hasReinforced,
    hasShielded, hasProtected, hasGuarded, hasArmored,
    unhandledCount, untestedCount,
  }
}

/** @example measureUnderstanding('export class X { readonly y: string }') */
export function measureUnderstanding(content: string): UnderstandingMeasure {
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
  const hasConnected = (content.match(/\b(eval|Function)\b/g) ?? []).length === 0
  const hasPurposeful = (content.match(/\b(var|eval)\b/g) ?? []).length === 0
  const hasWise = (content.match(/\b(hack|workaround|kludge)\b/gi) ?? []).length === 0
  const hasProfound = (content.match(/\b(unused|dead|obsolete|deprecated)\b/gi) ?? []).length === 0
  const shallowCount = (content.match(/\b(shallow|superficial|trivial)\b/gi) ?? []).length

  const positiveBooleans = [
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPurposeful, hasWise, hasProfound,
  ]

  const wisdom = computeScore(positiveBooleans)
  const hasHighWisdom = wisdom >= 60

  let center: UnderstandingMeasure['center'] = 'no-wisdom'
  if (wisdom >= 90) center = 'labyrinth-core'
  else if (wisdom >= 75) center = 'deep-center'
  else if (wisdom >= 60) center = 'proper-middle'
  else if (wisdom >= 40) center = 'shallow-heart'
  else if (wisdom >= 20) center = 'no-center'

  return {
    wisdom, center, hasHighWisdom,
    hasWellArchitected, hasNoHacked, hasPrincipled, hasDeep, hasStrategic,
    hasHolistic, hasProven, hasMature, hasInsightful, hasVisionary,
    hasComprehensive, hasConnected, hasPurposeful, hasWise, hasProfound,
    hackedCount, shallowCount,
  }
}

// ─── Analysis functions ─────────────────────────────────

/** @example analyzeSilverCorridor(content, 'app.ts') */
export function analyzeSilverCorridor(content: string, filePath: string): SilverCorridor {
  const mirroring = measureMirroring(content)
  const guiding = measureGuiding(content)
  const constructing = measureConstructing(content)
  const defending = measureDefending(content)
  const understanding = measureUnderstanding(content)

  const reflectivePurity = mirroring.purity
  const pathClarity = guiding.clarity
  const mazePrecision = constructing.precision
  const wallResilience = defending.resilience
  const centerWisdom = understanding.wisdom

  const qualityScore = Math.round(
    reflectivePurity * 0.2 +
    pathClarity * 0.2 +
    mazePrecision * 0.2 +
    wallResilience * 0.2 +
    centerWisdom * 0.2,
  )

  const condition = classifySilverCondition(qualityScore)

  return {
    file: filePath,
    reflectivePurity, pathClarity, mazePrecision, wallResilience, centerWisdom,
    mirroring, guiding, constructing, defending, understanding,
    condition, qualityScore,
  }
}

/** @example analyzeSilverMaze(corridors, 'src') */
export function analyzeSilverMaze(corridors: SilverCorridor[], dirPath: string): SilverMaze {
  if (corridors.length === 0) {
    return {
      directory: dirPath, corridors: [],
      avgPurity: 0, avgPrecision: 0, avgWisdom: 0,
      silverMasterpieceCount: 0, voidCount: 0,
      mazeType: 'no-maze', condition: 'void',
    }
  }

  const avgPurity = Math.round(corridors.reduce((s, c) => s + c.reflectivePurity, 0) / corridors.length)
  const avgPrecision = Math.round(corridors.reduce((s, c) => s + c.mazePrecision, 0) / corridors.length)
  const avgWisdom = Math.round(corridors.reduce((s, c) => s + c.centerWisdom, 0) / corridors.length)
  const silverMasterpieceCount = corridors.filter((c) => c.condition === 'silver-masterpiece').length
  const voidCount = corridors.filter((c) => c.condition === 'void').length
  const mazeType = classifyMazeType(corridors)
  const avgQuality = Math.round(corridors.reduce((s, c) => s + c.qualityScore, 0) / corridors.length)
  const condition = classifyMazeCondition(avgQuality)

  return {
    directory: dirPath, corridors,
    avgPurity, avgPrecision, avgWisdom,
    silverMasterpieceCount, voidCount,
    mazeType, condition,
  }
}

// ─── Orchestrator ───────────────────────────────────────

/** @example buildSilverLabyrinthResult(['a.ts'], [content]) */
export async function buildSilverLabyrinthResult(
  files: string[],
  contents: string[],
  _options?: Record<string, unknown>,
): Promise<SilverLabyrinthResult> {
  const corridors: SilverCorridor[] = files.map((file, i) =>
    analyzeSilverCorridor(contents[i] ?? '', file),
  )

  const dirMap = new Map<string, SilverCorridor[]>()
  for (const corridor of corridors) {
    const dir = corridor.file.includes('/')
      ? corridor.file.substring(0, corridor.file.lastIndexOf('/'))
      : '.'
    const existing = dirMap.get(dir)
    if (existing) {
      existing.push(corridor)
    } else {
      dirMap.set(dir, [corridor])
    }
  }

  const mazes: SilverMaze[] = Array.from(dirMap.entries()).map(([dir, dirCorridors]) =>
    analyzeSilverMaze(dirCorridors, dir),
  )

  const avgReflectivePurity = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.reflectivePurity, 0) / corridors.length) : 0
  const avgPathClarity = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.pathClarity, 0) / corridors.length) : 0
  const avgMazePrecision = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.mazePrecision, 0) / corridors.length) : 0
  const avgWallResilience = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.wallResilience, 0) / corridors.length) : 0
  const avgCenterWisdom = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.centerWisdom, 0) / corridors.length) : 0

  const overallReflection = corridors.length > 0
    ? Math.round(corridors.reduce((s, c) => s + c.qualityScore, 0) / corridors.length) : 0
  const isSilver = overallReflection >= 60

  const labyrinth: SilverLabyrinthResult['labyrinth'] = {
    avgPurity: avgReflectivePurity, avgPrecision: avgMazePrecision, avgWisdom: avgCenterWisdom,
    isSilver, overallReflection,
  }

  const silverMasterpieceCount = corridors.filter((c) => c.condition === 'silver-masterpiece').length
  const mirrorLabyrinthCount = corridors.filter((c) => c.condition === 'mirror-labyrinth').length
  const properSilverCount = corridors.filter((c) => c.condition === 'proper-silver').length
  const tarnishedMetalCount = corridors.filter((c) => c.condition === 'tarnished-metal').length
  const rustyIronCount = corridors.filter((c) => c.condition === 'rusty-iron').length
  const voidCount = corridors.filter((c) => c.condition === 'void').length

  const hasHighPurityCount = corridors.filter((c) => c.mirroring.hasHighPurity).length
  const hasHighClarityCount = corridors.filter((c) => c.guiding.hasHighClarity).length
  const hasHighPrecisionCount = corridors.filter((c) => c.constructing.hasHighPrecision).length
  const hasHighResilienceCount = corridors.filter((c) => c.defending.hasHighResilience).length
  const hasHighWisdomCount = corridors.filter((c) => c.understanding.hasHighWisdom).length

  const navigatorGrade = classifyNavigatorGrade(overallReflection)

  const bestCorridor = corridors.length > 0
    ? corridors.reduce((best, c) => (c.qualityScore > best.qualityScore ? c : best)).file : ''
  const purest = corridors.length > 0
    ? corridors.reduce((best, c) => (c.reflectivePurity > best.reflectivePurity ? c : best)).file : ''
  const clearest = corridors.length > 0
    ? corridors.reduce((best, c) => (c.pathClarity > best.pathClarity ? c : best)).file : ''
  const mostPrecise = corridors.length > 0
    ? corridors.reduce((best, c) => (c.mazePrecision > best.mazePrecision ? c : best)).file : ''
  const mostResilient = corridors.length > 0
    ? corridors.reduce((best, c) => (c.wallResilience > best.wallResilience ? c : best)).file : ''
  const wisest = corridors.length > 0
    ? corridors.reduce((best, c) => (c.centerWisdom > best.centerWisdom ? c : best)).file : ''

  const stats: SilverLabyrinthResult['stats'] = {
    totalFiles: files.length, totalMazes: mazes.length,
    avgReflectivePurity, avgPathClarity, avgMazePrecision, avgWallResilience, avgCenterWisdom,
    silverMasterpieceCount, mirrorLabyrinthCount, properSilverCount, tarnishedMetalCount, rustyIronCount, voidCount,
    hasHighPurityCount, hasHighClarityCount, hasHighPrecisionCount, hasHighResilienceCount, hasHighWisdomCount,
    overallReflection, navigatorGrade,
    bestCorridor, purest, clearest, mostPrecise, mostResilient, wisest,
  }

  const recommendations = generateRecommendations(corridors, mazes, labyrinth, stats)

  return {
    corridors, mazes, labyrinth, stats, recommendations,
  }
}

// ─── Recommendations ────────────────────────────────────

/** @example generateRecommendations(corridors, mazes, labyrinth, stats) */
export function generateRecommendations(
  corridors: SilverCorridor[],
  mazes: SilverMaze[],
  labyrinth: SilverLabyrinthResult['labyrinth'],
  stats: SilverLabyrinthResult['stats'],
): string[] {
  const recs: string[] = []

  if (
    stats.avgReflectivePurity >= 90 &&
    stats.avgPathClarity >= 90 &&
    stats.avgMazePrecision >= 90 &&
    stats.avgWallResilience >= 90 &&
    stats.avgCenterWisdom >= 90
  ) {
    recs.push(
      'Your silver labyrinth is a perfect mirror palace! Reflective purity is perfect-mirror, path clarity is golden-thread, maze precision is architectural-perfection, wall resilience is impregnable-wall, and center wisdom is labyrinth-core!',
    )
    return recs
  }

  if (stats.avgReflectivePurity < 60) {
    recs.push(
      'Polish reflective purity — the silver mirrors must reflect truth; eliminate hacks, remove workarounds, and cleanse the codebase of tarnish'
    )
  }

  if (stats.avgPathClarity < 60) {
    recs.push(
      'Illuminate path clarity — the labyrinth corridors must be navigable; remove cryptic patterns, eliminate mystery code, and make every path self-documenting'
    )
  }

  if (stats.avgMazePrecision < 60) {
    recs.push(
      'Sharpen maze precision — every wall must be exact; tighten types, eliminate unsafe patterns, and build with architectural perfection'
    )
  }

  if (stats.avgWallResilience < 60) {
    recs.push(
      'Fortify wall resilience — the labyrinth walls must withstand any force; add error handling, eliminate untested code, and build impregnable defenses'
    )
  }

  if (stats.avgCenterWisdom < 60) {
    recs.push(
      'Deepen center wisdom — the labyrinth core must hold profound understanding; build with principled architecture, proven patterns, and visionary design'
    )
  }

  if (stats.overallReflection < 40) {
    recs.push(
      'The silver labyrinth is tarnished — rusty iron and tarnished metal outnumber the silver, and the maze leads nowhere'
    )
  }

  const voidCorridors = corridors.filter((c) => c.condition === 'void')
  if (voidCorridors.length > 0 && voidCorridors.length <= 5) {
    recs.push(`Polish these rusty iron corridors: ${voidCorridors.map((c) => c.file).join(', ')}`)
  } else if (voidCorridors.length > 5) {
    recs.push(`Polish ${voidCorridors.length} rusty iron corridors before the labyrinth collapses entirely`)
  }

  const poorMazes = mazes.filter((m) => m.condition === 'void' || m.condition === 'dirt-tunnel')
  if (poorMazes.length === mazes.length && mazes.length > 0) {
    recs.push('All maze sections are dirt tunnels — the silver labyrinth needs mirror-palace quality corridors throughout')
  }

  if (recs.length === 0) {
    recs.push('Your silver labyrinth shines with perfect reflection — every corridor carries reflective purity, path clarity, maze precision, wall resilience, and center wisdom')
  }

  return recs
}
