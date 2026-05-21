// ─── Interfaces ──────────────────────────────────────────────────────────────

export type TreasureType = 'gold' | 'gems' | 'artifacts' | 'supplies' | 'tools' | 'maps' | 'keys' | 'traps'
export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'cursed'
export type PathDifficulty = 'trivial' | 'easy' | 'moderate' | 'difficult' | 'perilous' | 'impossible'
export type RiskLevel = 'safe' | 'low' | 'moderate' | 'high' | 'extreme' | 'lethal'
export type SpotCondition = 'pristine-treasure' | 'well-preserved' | 'good-condition' | 'weathered' | 'decaying' | 'cursed'
export type IslandType = 'treasure-island' | 'trading-post' | 'outpost' | 'wreck' | 'desert-island' | 'volcano'
export type DangerLevel = 'safe-harbor' | 'calm-waters' | 'moderate' | 'dangerous' | 'treacherous' | 'deadly'
export type IslandCondition = 'paradise' | 'prosperous' | 'developing' | 'struggling' | 'abandoned' | 'ruins'
export type CartographerGrade = 'master-cartographer' | 'cartographer' | 'navigator' | 'sailor' | 'landlubber' | 'shipwrecked'

export interface BurialInfo {
  depth: number
  isExposed: boolean
  isBuried: boolean
  isHidden: boolean
  isTrapped: boolean
  hasMapMarker: boolean
  markerClarity: number
}

export interface GuardianInfo {
  complexity: number
  nesting: number
  abstractions: number
  hasDragons: boolean
  hasTraps: boolean
  hasPuzzles: boolean
  dragonCount: number
  trapCount: number
  puzzleCount: number
}

export interface ValueInfo {
  reusePotential: number
  isUnique: boolean
  isCritical: boolean
  isIrreplaceable: boolean
  dependents: number
  valueDensity: number
}

export interface NavigationInfo {
  isEasyToFind: boolean
  hasClearPath: boolean
  hasSignposts: boolean
  isMarked: boolean
  pathDifficulty: PathDifficulty
  hasDeadEnds: boolean
}

export interface DangerInfo {
  isStable: boolean
  isVolatile: boolean
  hasBoobyTraps: boolean
  hasDecay: boolean
  hasCurse: boolean
  riskLevel: RiskLevel
}

export interface TreasureSpot {
  file: string
  treasureValue: number
  burialDepth: number
  guardianCount: number
  mapLegibility: number
  xAccuracy: number
  pirateDanger: number
  treasureType: TreasureType
  rarity: Rarity
  burial: BurialInfo
  guardians: GuardianInfo
  value: ValueInfo
  navigation: NavigationInfo
  danger: DangerInfo
  condition: SpotCondition
  qualityScore: number
}

export interface TreasureIsland {
  directory: string
  spots: TreasureSpot[]
  totalValue: number
  avgTreasureValue: number
  avgBurialDepth: number
  avgMapLegibility: number
  legendaryCount: number
  cursedCount: number
  dragonCount: number
  trapCount: number
  exposedCount: number
  hiddenCount: number
  isWorthExploring: boolean
  islandType: IslandType
  dangerLevel: DangerLevel
  condition: IslandCondition
}

export interface ArchipelagoInfo {
  totalTreasureValue: number
  avgTreasureValue: number
  avgBurialDepth: number
  legendarySpots: number
  cursedSpots: number
  totalDragons: number
  totalTraps: number
  isWorthExploring: boolean
}

export interface TreasureMapStats {
  totalFiles: number
  totalIslands: number
  avgTreasureValue: number
  avgBurialDepth: number
  avgGuardianCount: number
  avgMapLegibility: number
  avgXAccuracy: number
  avgPirateDanger: number
  goldCount: number
  gemsCount: number
  artifactsCount: number
  toolsCount: number
  trapsCount: number
  legendaryCount: number
  mythicCount: number
  cursedCount: number
  commonCount: number
  exposedCount: number
  buriedCount: number
  hiddenCount: number
  dragonCount: number
  trapCount: number
  puzzleCount: number
  safeFiles: number
  lethalFiles: number
  totalTreasureValue: number
  overallMapQuality: number
  cartographerGrade: CartographerGrade
  mostValuable: string
  mostHidden: string
  mostDangerous: string
  easiestToFind: string
  bestPreserved: string
}

export interface TreasureMapResult {
  spots: TreasureSpot[]
  islands: TreasureIsland[]
  archipelago: ArchipelagoInfo
  stats: TreasureMapStats
  recommendations: string[]
}

// ─── Content Primitives ──────────────────────────────────────────────────────

/**
 * Count lines of code
 * @example
 * countLoc('const x = 1\nconst y = 2') // 2
 */
export function countLoc(content: string): number {
  return content.split('\n').filter(l => l.trim().length > 0).length
}

/**
 * Count imports
 * @example
 * countImports('import { x } from "y"') // 1
 */
export function countImports(content: string): number {
  return (content.match(/^import\s+/gm) ?? []).length
}

/**
 * Count exports
 * @example
 * countExports('export function a() {}') // 1
 */
export function countExports(content: string): number {
  return (content.match(/\bexport\s+(?:default\s+)?(?:function|class|const|let|var|interface|type|enum)\s+/g) ?? []).length
}

/**
 * Count functions
 * @example
 * countFunctions('function a() {}') // 1
 */
export function countFunctions(content: string): number {
  return (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>)/g) ?? []).length
}

/**
 * Count error handling
 * @example
 * countErrorHandling('try {} catch(e) {}') // 2
 */
export function countErrorHandling(content: string): number {
  return (content.match(/\btry\s*\{|\bcatch\s*\(|\.catch\s*\(|\bthrow\s+/g) ?? []).length
}

/**
 * Count type annotations
 * @example
 * countTypeAnnotations('const x: number = 1') // 1
 */
export function countTypeAnnotations(content: string): number {
  return (content.match(/:\s*(?:string|number|boolean|void|any|never|unknown|object)/g) ?? []).length
}

/**
 * Count branches
 * @example
 * countBranches('if (a) {}') // 1
 */
export function countBranches(content: string): number {
  return (content.match(/\bif\s*\(|\?\s*[^?]\s*:|\bswitch\s*\(/g) ?? []).length
}

/**
 * Count max nesting depth
 * @example
 * maxNesting('{{{}}}') // 3
 */
export function maxNesting(content: string): number {
  let max = 0
  let cur = 0
  for (const ch of content) {
    if (ch === '{') { cur++; if (cur > max) max = cur }
    else if (ch === '}') { cur = Math.max(0, cur - 1) }
  }
  return max
}

/**
 * Count console statements
 * @example
 * countConsole('console.log("x")') // 1
 */
export function countConsole(content: string): number {
  return (content.match(/console\.\w+\s*\(/g) ?? []).length
}

/**
 * Count comments
 * @example
 * countComments('// hello') // 1
 */
export function countComments(content: string): number {
  return (content.match(/\/\//g) ?? []).length + (content.match(/\/\*/g) ?? []).length
}

/**
 * Count TODO markers
 * @example
 * countTodos('TODO: fix') // 1
 */
export function countTodos(content: string): number {
  return (content.match(/TODO|FIXME|HACK|XXX/gi) ?? []).length
}

/**
 * Count abstraction layers (classes, interfaces, types)
 * @example
 * countAbstractions('class A {} interface B {}') // 2
 */
export function countAbstractions(content: string): number {
  return (content.match(/\bclass\s+\w|\binterface\s+\w|\btype\s+\w+\s*=/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify treasure type from code structure
 * @example
 * classifyTreasureType('export function a() {}') // 'tools'
 */
export function classifyTreasureType(content: string): TreasureType {
  const exports = countExports(content)
  const imports = countImports(content)
  const funcs = countFunctions(content)
  const hasClass = /\bclass\s+\w/.test(content)
  const hasInterface = /\binterface\s+\w/.test(content)
  const hasTypeAlias = /\btype\s+\w+\s*=/.test(content)

  if (hasInterface && hasClass && exports > 3) return 'gold'
  if (hasInterface && hasTypeAlias && exports > 1) return 'gems'
  if (hasClass && exports > 1) return 'artifacts'
  if (imports > 3 && countErrorHandling(content) > 2) return 'supplies'
  if (exports > 0 && funcs > 0) return 'tools'
  if (hasInterface || hasTypeAlias) return 'maps'
  if (exports > 0) return 'keys'
  if (countConsole(content) > 5 || countTodos(content) > 3) return 'traps'
  return 'supplies'
}

/**
 * Classify rarity based on value and uniqueness
 * @example
 * classifyRarity(90, true, true) // 'legendary'
 */
export function classifyRarity(value: number, isUnique: boolean, isCritical: boolean): Rarity {
  if (value >= 85 && isUnique && isCritical) return 'mythic'
  if (value >= 75 && isCritical) return 'legendary'
  if (value >= 60 && isUnique) return 'epic'
  if (value >= 50) return 'rare'
  if (value >= 30) return 'uncommon'
  if (value < 10 && !isCritical) return 'cursed'
  return 'common'
}

/**
 * Classify spot condition from quality score
 * @example
 * classifySpotCondition(85) // 'pristine-treasure'
 */
export function classifySpotCondition(qualityScore: number): SpotCondition {
  if (qualityScore >= 85) return 'pristine-treasure'
  if (qualityScore >= 70) return 'well-preserved'
  if (qualityScore >= 55) return 'good-condition'
  if (qualityScore >= 35) return 'weathered'
  if (qualityScore >= 15) return 'decaying'
  return 'cursed'
}

/**
 * Classify path difficulty
 * @example
 * classifyPathDifficulty(20) // 'trivial'
 */
export function classifyPathDifficulty(difficulty: number): PathDifficulty {
  if (difficulty >= 80) return 'impossible'
  if (difficulty >= 60) return 'perilous'
  if (difficulty >= 40) return 'difficult'
  if (difficulty >= 25) return 'moderate'
  if (difficulty >= 10) return 'easy'
  return 'trivial'
}

/**
 * Classify risk level
 * @example
 * classifyRiskLevel(75) // 'high'
 */
export function classifyRiskLevel(danger: number): RiskLevel {
  if (danger >= 80) return 'lethal'
  if (danger >= 60) return 'extreme'
  if (danger >= 40) return 'high'
  if (danger >= 25) return 'moderate'
  if (danger >= 10) return 'low'
  return 'safe'
}

/**
 * Classify island type from average treasure value
 * @example
 * classifyIslandType(80, 5) // 'treasure-island'
 */
export function classifyIslandType(avgValue: number, spotCount: number): IslandType {
  if (avgValue >= 70 && spotCount > 3) return 'treasure-island'
  if (avgValue >= 50 && spotCount > 1) return 'trading-post'
  if (spotCount > 5) return 'outpost'
  if (avgValue < 15 && spotCount > 0) return 'volcano'
  if (spotCount === 0) return 'desert-island'
  return 'wreck'
}

/**
 * Classify island danger level
 * @example
 * classifyIslandDanger(75) // 'treacherous'
 */
export function classifyIslandDanger(avgDanger: number): DangerLevel {
  if (avgDanger >= 70) return 'deadly'
  if (avgDanger >= 50) return 'treacherous'
  if (avgDanger >= 30) return 'dangerous'
  if (avgDanger >= 15) return 'moderate'
  if (avgDanger >= 5) return 'calm-waters'
  return 'safe-harbor'
}

/**
 * Classify island condition
 * @example
 * classifyIslandCondition(80) // 'paradise'
 */
export function classifyIslandCondition(avgQuality: number): IslandCondition {
  if (avgQuality >= 75) return 'paradise'
  if (avgQuality >= 55) return 'prosperous'
  if (avgQuality >= 40) return 'developing'
  if (avgQuality >= 25) return 'struggling'
  if (avgQuality >= 10) return 'abandoned'
  return 'ruins'
}

/**
 * Classify cartographer grade
 * @example
 * classifyCartographerGrade(85) // 'master-cartographer'
 */
export function classifyCartographerGrade(avgQuality: number): CartographerGrade {
  if (avgQuality >= 80) return 'master-cartographer'
  if (avgQuality >= 65) return 'cartographer'
  if (avgQuality >= 45) return 'navigator'
  if (avgQuality >= 30) return 'sailor'
  if (avgQuality >= 15) return 'landlubber'
  return 'shipwrecked'
}

// ─── Assessment Functions ─────────────────────────────────────────────────────

/**
 * Assess burial depth and accessibility
 * @example
 * assessBurial('export function a() {}') // BurialInfo
 */
export function assessBurial(content: string): BurialInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const comments = countComments(content)
  const types = countTypeAnnotations(content)

  const depth = Math.min(100, Math.round(
    (loc > 100 ? 20 : 0) +
    (maxNesting(content) > 4 ? 15 : 0) +
    (exports === 0 && loc > 20 ? 25 : 0) +
    (comments === 0 ? 15 : 0) +
    (types === 0 && loc > 10 ? 10 : 0) +
    (countAbstractions(content) > 2 ? 10 : 0),
  ))

  const isExposed = exports > 0
  const isBuried = depth > 40
  const isHidden = comments === 0 && exports === 0 && loc > 5
  const isTrapped = countTodos(content) > 2 && countErrorHandling(content) === 0
  const hasMapMarker = comments > 0 || exports > 0
  const markerClarity = Math.min(100, Math.round(
    (comments > 0 ? 30 : 0) +
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (countFunctions(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0),
  ))

  return { depth, isExposed, isBuried, isHidden, isTrapped, hasMapMarker, markerClarity }
}

/**
 * Assess guardians (complexity protecting the code)
 * @example
 * assessGuardians('if (a) { if (b) { return 1 } }') // GuardianInfo
 */
export function assessGuardians(content: string): GuardianInfo {
  const loc = countLoc(content)
  const nest = maxNesting(content)
  const branches = countBranches(content)
  const abstractions = countAbstractions(content)

  const complexity = Math.min(100, Math.round(
    branches * 5 +
    nest * 8 +
    (loc > 50 ? 10 : 0) +
    (countFunctions(content) > 5 ? 10 : 0),
  ))

  const dragonCount = Math.max(0, Math.floor((complexity - 40) / 20))
  const trapCount = countTodos(content) + (countErrorHandling(content) === 0 && loc > 30 ? 1 : 0)
  const puzzleCount = Math.max(0, abstractions - 1)

  return {
    complexity,
    nesting: nest,
    abstractions,
    hasDragons: dragonCount > 0,
    hasTraps: trapCount > 0,
    hasPuzzles: puzzleCount > 0,
    dragonCount,
    trapCount,
    puzzleCount,
  }
}

/**
 * Assess navigation (how easy to find and use)
 * @example
 * assessNavigation('export function a(): number { return 1 }') // NavigationInfo
 */
export function assessNavigation(content: string): NavigationInfo {
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const comments = countComments(content)
  const branches = countBranches(content)
  const nest = maxNesting(content)

  const isEasyToFind = exports > 0 && types > 0
  const hasClearPath = imports > 0 && exports > 0
  const hasSignposts = types > 0 || comments > 0
  const isMarked = comments > 0

  const rawDifficulty = Math.round(
    (exports === 0 ? 20 : 0) +
    (comments === 0 ? 15 : 0) +
    (types === 0 ? 10 : 0) +
    (branches > 8 ? 15 : 0) +
    (nest > 4 ? 15 : 0),
  )
  const pathDifficulty = classifyPathDifficulty(rawDifficulty)
  const hasDeadEnds = countFunctions(content) > 0 && exports === 0

  return { isEasyToFind, hasClearPath, hasSignposts, isMarked, pathDifficulty, hasDeadEnds }
}

/**
 * Assess danger (risk and stability)
 * @example
 * assessDanger('TODO: fix\nHACK: temp') // DangerInfo
 */
export function assessDanger(content: string): DangerInfo {
  const loc = countLoc(content)
  const todos = countTodos(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const console_ = countConsole(content)

  const isStable = todos === 0 && errors > 0 && branches <= 8
  const isVolatile = todos > 2 || (errors === 0 && loc > 30)
  const hasBoobyTraps = countTodos(content) > 0 && countErrorHandling(content) === 0
  const hasDecay = todos > 1 || (countComments(content) === 0 && loc > 50)
  const hasCurse = todos > 3 && countErrorHandling(content) === 0 && loc > 20

  const rawDanger = Math.min(100, Math.round(
    (todos > 3 ? 25 : todos > 1 ? 12 : 0) +
    (errors === 0 && loc > 30 ? 20 : 0) +
    (branches > 8 ? 15 : 0) +
    (maxNesting(content) > 5 ? 15 : 0) +
    (console_ > 5 ? 10 : 0) +
    (countComments(content) === 0 && loc > 40 ? 10 : 0),
  ))

  return {
    isStable,
    isVolatile,
    hasBoobyTraps,
    hasDecay,
    hasCurse,
    riskLevel: classifyRiskLevel(rawDanger),
  }
}

/**
 * Measure value metrics of code
 * @example
 * measureValue('export function calc(): number { return 1 }', 3) // ValueInfo
 */
export function measureValue(content: string, dependents: number): ValueInfo {
  const loc = countLoc(content)
  const exports = countExports(content)
  const funcs = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const hasInterface = /\binterface\s+\w/.test(content)
  const hasClass = /\bclass\s+\w/.test(content)

  const reusePotential = Math.min(100, Math.round(
    (exports > 0 ? 25 : 0) +
    (types > 0 ? 20 : 0) +
    (errors > 0 ? 15 : 0) +
    (hasInterface ? 15 : 0) +
    (funcs > 0 ? 10 : 0) +
    (countComments(content) > 0 ? 10 : 0) +
    (dependents * 5),
  ))

  const isUnique = hasClass || (hasInterface && exports > 0)
  const isCritical = exports > 0 && errors > 0
  const isIrreplaceable = hasClass && hasInterface && exports > 1

  const valueDensity = loc > 0
    ? Math.min(100, Math.round(((exports + funcs + types + errors) / loc) * 100))
    : 0

  return { reusePotential, isUnique, isCritical, isIrreplaceable, dependents, valueDensity }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a treasure spot
 * @example
 * analyzeTreasureSpot('export function calc() { return 1 }', 'calc.ts') // TreasureSpot
 */
export function analyzeTreasureSpot(content: string, filePath: string): TreasureSpot {
  const loc = countLoc(content)
  const burial = assessBurial(content)
  const guardians = assessGuardians(content)
  const value = measureValue(content, 0)
  const navigation = assessNavigation(content)
  const danger = assessDanger(content)

  const treasureValue = Math.min(100, Math.round(
    value.reusePotential * 0.25 +
    (value.isUnique ? 15 : 0) +
    (value.isCritical ? 15 : 0) +
    (burial.isExposed ? 10 : 0) +
    (navigation.hasSignposts ? 10 : 0) +
    (danger.isStable ? 10 : 0) +
    (value.valueDensity > 20 ? 10 : 0) +
    5,
  ))

  const mapLegibility = Math.min(100, Math.round(
    (countComments(content) > 0 ? 25 : 0) +
    (countExports(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (loc > 0 ? 10 : 0) +
    (countFunctions(content) > 0 ? 10 : 0) +
    (countErrorHandling(content) > 0 ? 10 : 0) +
    (maxNesting(content) <= 3 ? 10 : 0) - (countTodos(content) > 2 ? 10 : 0),
  ))

  const xAccuracy = Math.min(100, Math.round(
    (countExports(content) > 0 ? 30 : 0) +
    (countFunctions(content) > 0 ? 20 : 0) +
    (countTypeAnnotations(content) > 0 ? 20 : 0) +
    (countComments(content) > 0 ? 15 : 0) +
    (loc > 0 ? 10 : 0) +
    (countImports(content) > 0 ? 5 : 0),
  ))

  const pirateDanger = Math.min(100, Math.round(
    (countTodos(content) > 2 ? 20 : countTodos(content) > 0 ? 8 : 0) +
    (countErrorHandling(content) === 0 && loc > 30 ? 20 : 0) +
    (maxNesting(content) > 5 ? 15 : 0) +
    (countBranches(content) > 10 ? 15 : 0) +
    (countConsole(content) > 5 ? 10 : 0) +
    (countComments(content) === 0 && loc > 50 ? 10 : 0),
  ))

  const treasureType = classifyTreasureType(content)
  const guardianCount = guardians.dragonCount + guardians.trapCount + guardians.puzzleCount

  const rarity = classifyRarity(treasureValue, value.isUnique, value.isCritical)

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    treasureValue * 0.3 +
    mapLegibility * 0.2 +
    xAccuracy * 0.15 +
    (100 - pirateDanger) * 0.15 +
    (100 - burial.depth) * 0.1 +
    (danger.isStable ? 10 : 0) - (danger.hasCurse ? 10 : 0),
  )))

  const condition = classifySpotCondition(qualityScore)

  return {
    file: filePath, treasureValue, burialDepth: burial.depth,
    guardianCount, mapLegibility, xAccuracy, pirateDanger,
    treasureType, rarity, burial, guardians, value, navigation, danger,
    condition, qualityScore,
  }
}

// ─── Island Analysis ─────────────────────────────────────────────────────────

/**
 * Analyze a directory as a treasure island
 * @example
 * analyzeTreasureIsland(spots, 'src') // TreasureIsland
 */
export function analyzeTreasureIsland(spots: TreasureSpot[], dirPath: string): TreasureIsland {
  if (spots.length === 0) {
    return {
      directory: dirPath, spots: [], totalValue: 0, avgTreasureValue: 0,
      avgBurialDepth: 0, avgMapLegibility: 0, legendaryCount: 0, cursedCount: 0,
      dragonCount: 0, trapCount: 0, exposedCount: 0, hiddenCount: 0,
      isWorthExploring: true, islandType: 'desert-island',
      dangerLevel: 'safe-harbor', condition: 'ruins',
    }
  }

  const n = spots.length
  const avgTreasureValue = Math.round(spots.reduce((s, sp) => s + sp.treasureValue, 0) / n)
  const avgBurialDepth = Math.round(spots.reduce((s, sp) => s + sp.burialDepth, 0) / n)
  const avgMapLegibility = Math.round(spots.reduce((s, sp) => s + sp.mapLegibility, 0) / n)
  const avgDanger = Math.round(spots.reduce((s, sp) => s + sp.pirateDanger, 0) / n)
  const avgQuality = Math.round(spots.reduce((s, sp) => s + sp.qualityScore, 0) / n)

  const legendaryCount = spots.filter(s => s.rarity === 'legendary' || s.rarity === 'mythic').length
  const cursedCount = spots.filter(s => s.rarity === 'cursed').length
  const dragonCount = spots.reduce((s, sp) => s + sp.guardians.dragonCount, 0)
  const trapCount = spots.reduce((s, sp) => s + sp.guardians.trapCount, 0)
  const exposedCount = spots.filter(s => s.burial.isExposed).length
  const hiddenCount = spots.filter(s => s.burial.isHidden).length
  const totalValue = spots.reduce((s, sp) => s + sp.treasureValue, 0)

  return {
    directory: dirPath, spots, totalValue, avgTreasureValue,
    avgBurialDepth, avgMapLegibility, legendaryCount, cursedCount,
    dragonCount, trapCount, exposedCount, hiddenCount,
    isWorthExploring: avgTreasureValue >= 30,
    islandType: classifyIslandType(avgTreasureValue, n),
    dangerLevel: classifyIslandDanger(avgDanger),
    condition: classifyIslandCondition(avgQuality),
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate treasure map recommendations
 * @example
 * generateRecommendations(spots, islands, arch, stats) // string[]
 */
export function generateRecommendations(
  _spots: TreasureSpot[],
  _islands: TreasureIsland[],
  _archipelago: ArchipelagoInfo,
  stats: TreasureMapStats,
): string[] {
  void _spots
  void _islands
  void _archipelago
  const recs: string[] = []

  if (stats.cursedCount > 0) {
    recs.push(`Cursed treasure: ${stats.cursedCount} files have extremely low value and should be refactored or removed`)
  }
  if (stats.hiddenCount > stats.exposedCount) {
    recs.push(`Hidden treasure: more files are undocumented than exposed - consider adding exports and documentation`)
  }
  if (stats.dragonCount > 0) {
    recs.push(`Dragons ahead: ${stats.dragonCount} files contain extremely complex code sections`)
  }
  if (stats.trapCount > 0) {
    recs.push(`Traps detected: ${stats.trapCount} files contain TODOs without error handling`)
  }
  if (stats.lethalFiles > 0) {
    recs.push(`Lethal danger: ${stats.lethalFiles} files have extreme risk of degradation`)
  }
  if (stats.overallMapQuality >= 60) {
    recs.push('Good map quality: the codebase is well-documented and navigable')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete treasure map result from files and contents
 * @example
 * buildTreasureMapResult(['a.ts'], ['export function a() {}'], {}) // TreasureMapResult
 */
export function buildTreasureMapResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): TreasureMapResult {
  void options

  const spots: TreasureSpot[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeTreasureSpot(content, file)
    } catch {
      return analyzeTreasureSpot('', file)
    }
  })

  const dirMap = new Map<string, TreasureSpot[]>()
  for (const sp of spots) {
    const dir = sp.file.includes('/') ? sp.file.slice(0, sp.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(sp) } else { dirMap.set(dir, [sp]) }
  }

  const islands: TreasureIsland[] = Array.from(dirMap.entries()).map(([dir, spts]) =>
    analyzeTreasureIsland(spts, dir),
  )

  const n = spots.length || 1
  const totalTreasureValue = spots.reduce((s, sp) => s + sp.treasureValue, 0)
  const avgTreasureValue = Math.round(totalTreasureValue / n)
  const avgBurialDepth = Math.round(spots.reduce((s, sp) => s + sp.burialDepth, 0) / n)
  const avgMapLegibility = Math.round(spots.reduce((s, sp) => s + sp.mapLegibility, 0) / n)
  const avgXAccuracy = Math.round(spots.reduce((s, sp) => s + sp.xAccuracy, 0) / n)
  const avgPirateDanger = Math.round(spots.reduce((s, sp) => s + sp.pirateDanger, 0) / n)
  const avgGuardianCount = Math.round(spots.reduce((s, sp) => s + sp.guardianCount, 0) / n)

  const overallMapQuality = Math.min(100, Math.max(0, Math.round(
    avgMapLegibility * 0.3 +
    avgXAccuracy * 0.2 +
    avgTreasureValue * 0.2 +
    (100 - avgPirateDanger) * 0.15 +
    (100 - avgBurialDepth) * 0.15,
  )))

  const legendarySpots = spots.filter(s => s.rarity === 'legendary' || s.rarity === 'mythic').length
  const cursedSpots = spots.filter(s => s.rarity === 'cursed').length
  const totalDragons = spots.reduce((s, sp) => s + sp.guardians.dragonCount, 0)
  const totalTraps = spots.reduce((s, sp) => s + sp.guardians.trapCount, 0)

  const archipelago: ArchipelagoInfo = {
    totalTreasureValue,
    avgTreasureValue,
    avgBurialDepth,
    legendarySpots,
    cursedSpots,
    totalDragons,
    totalTraps,
    isWorthExploring: avgTreasureValue >= 30,
  }

  const stats: TreasureMapStats = {
    totalFiles: files.length,
    totalIslands: islands.length,
    avgTreasureValue,
    avgBurialDepth,
    avgGuardianCount,
    avgMapLegibility,
    avgXAccuracy,
    avgPirateDanger,
    goldCount: spots.filter(s => s.treasureType === 'gold').length,
    gemsCount: spots.filter(s => s.treasureType === 'gems').length,
    artifactsCount: spots.filter(s => s.treasureType === 'artifacts').length,
    toolsCount: spots.filter(s => s.treasureType === 'tools').length,
    trapsCount: spots.filter(s => s.treasureType === 'traps').length,
    legendaryCount: legendarySpots,
    mythicCount: spots.filter(s => s.rarity === 'mythic').length,
    cursedCount: cursedSpots,
    commonCount: spots.filter(s => s.rarity === 'common').length,
    exposedCount: spots.filter(s => s.burial.isExposed).length,
    buriedCount: spots.filter(s => s.burial.isBuried).length,
    hiddenCount: spots.filter(s => s.burial.isHidden).length,
    dragonCount: totalDragons,
    trapCount: totalTraps,
    puzzleCount: spots.reduce((s, sp) => s + sp.guardians.puzzleCount, 0),
    safeFiles: spots.filter(s => s.danger.riskLevel === 'safe').length,
    lethalFiles: spots.filter(s => s.danger.riskLevel === 'lethal').length,
    totalTreasureValue,
    overallMapQuality,
    cartographerGrade: classifyCartographerGrade(overallMapQuality),
    mostValuable: spots.length > 0
      ? spots.reduce((a, b) => b.treasureValue > a.treasureValue ? b : a, spots[0]).file : 'none',
    mostHidden: spots.length > 0
      ? spots.reduce((a, b) => b.burialDepth > a.burialDepth ? b : a, spots[0]).file : 'none',
    mostDangerous: spots.length > 0
      ? spots.reduce((a, b) => b.pirateDanger > a.pirateDanger ? b : a, spots[0]).file : 'none',
    easiestToFind: spots.length > 0
      ? spots.reduce((a, b) => b.mapLegibility > a.mapLegibility ? b : a, spots[0]).file : 'none',
    bestPreserved: spots.length > 0
      ? spots.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, spots[0]).file : 'none',
  }

  const recommendations = generateRecommendations(spots, islands, archipelago, stats)

  return { spots, islands, archipelago, stats, recommendations }
}
