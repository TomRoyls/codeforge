// ─── Interfaces ──────────────────────────────────────────────────────────────

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'
export type PieceCondition = 'grandmaster-move' | 'strong-position' | 'developed' | 'opening' | 'blunder' | 'checkmate'
export type RankType = 'kingside' | 'queenside' | 'center' | 'flank' | 'back-rank' | 'ruins'
export type RankCondition = 'winning-position' | 'advantage' | 'equal' | 'disadvantage' | 'losing' | 'resigned'
export type PlayerGrade = 'grandmaster' | 'master' | 'expert' | 'intermediate' | 'beginner' | 'novice'

export interface ChessPiece {
  file: string
  pieceType: PieceType
  mobility: number
  boardControl: number
  tacticalStrength: number
  strategicDepth: number
  coordination: number
  endgameStability: number
  position: {
    rank: number
    file: number
    isDeveloped: boolean
    isActive: boolean
    isPinned: boolean
    isForked: boolean
    isDiscovered: boolean
    isEnPrise: boolean
    squaresControlled: number
  }
  mobilityDetail: {
    availableMoves: number
    isMobile: boolean
    isBlocked: boolean
    hasEscape: boolean
    isTrapped: boolean
    blockingPieces: number
    moveQuality: number
  }
  tactics: {
    hasForks: boolean
    hasPins: boolean
    hasSkewers: boolean
    hasDiscoveredAttacks: boolean
    hasSacrifices: boolean
    isUnderAttack: boolean
    isDefended: boolean
    attackSurface: number
    defenseDepth: number
  }
  strategy: {
    isCentralized: boolean
    isFlanked: boolean
    isAdvanced: boolean
    isRetreated: boolean
    hasClearPlan: boolean
    hasInitiative: boolean
    strategicValue: number
  }
  coordinationDetail: {
    protectedPieces: number
    attackingPieces: number
    isSacrificed: boolean
    isCoordinated: boolean
    hasTempo: boolean
    hasDoubleAttack: boolean
  }
  endgame: {
    isPromotable: boolean
    isPassed: boolean
    isConnected: boolean
    isIsolated: boolean
    isDoubled: boolean
    isBackward: boolean
    pawnStructure: number
    kingSafety: number
  }
  condition: PieceCondition
  qualityScore: number
}

export interface ChessRank {
  directory: string
  pieces: ChessPiece[]
  avgMobility: number
  avgTacticalStrength: number
  avgStrategicDepth: number
  avgCoordination: number
  grandmasterCount: number
  blunderCount: number
  checkmateCount: number
  rankType: RankType
  condition: RankCondition
}

export interface ChessGame {
  avgMobility: number
  avgTacticalStrength: number
  avgStrategicDepth: number
  avgCoordination: number
  avgEndgameStability: number
  isWinning: boolean
  overallPosition: number
}

export interface ChessBoardStats {
  totalFiles: number
  totalRanks: number
  avgMobility: number
  avgBoardControl: number
  avgTacticalStrength: number
  avgStrategicDepth: number
  avgCoordination: number
  avgEndgameStability: number
  kingCount: number
  queenCount: number
  rookCount: number
  bishopCount: number
  knightCount: number
  pawnCount: number
  grandmasterMoveCount: number
  strongPositionCount: number
  developedCount: number
  openingCount: number
  blunderCount: number
  checkmateCount: number
  developedPieces: number
  activePieces: number
  pinnedPieces: number
  trappedPieces: number
  defendedPieces: number
  underAttackPieces: number
  centralizedPieces: number
  isolatedPieces: number
  promotablePieces: number
  hasClearPlanCount: number
  overallPosition: number
  playerGrade: PlayerGrade
  bestPosition: string
  worstPosition: string
  mostPowerful: string
  mostStrategic: string
  mostCoordinated: string
}

export interface ChessBoardResult {
  pieces: ChessPiece[]
  ranks: ChessRank[]
  game: ChessGame
  stats: ChessBoardStats
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
 * Count classes
 * @example
 * countClasses('class Foo {}') // 1
 */
export function countClasses(content: string): number {
  return (content.match(/\bclass\s+\w+/g) ?? []).length
}

/**
 * Count error handling constructs
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
  let m = 0
  let c = 0
  for (const ch of content) {
    if (ch === '{') { c++; if (c > m) m = c }
    else if (ch === '}') { c = Math.max(0, c - 1) }
  }
  return m
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
 * Count JSDoc blocks
 * @example
 * countJSDoc('/** doc * slash /') // 1
 */
export function countJSDoc(content: string): number {
  return (content.match(/\/\*\*/g) ?? []).length
}

/**
 * Count descriptive names (camelCase longer than 3 chars)
 * @example
 * countDescriptiveNames('function calculateTotal() {}') // 1
 */
export function countDescriptiveNames(content: string): number {
  return (content.match(/\b(?:function|const|let|var)\s+[a-z]{1}[a-zA-Z]{3,}\b/g) ?? []).length
}

/**
 * Count short names (1-2 chars)
 * @example
 * countShortNames('const x = 1') // 1
 */
export function countShortNames(content: string): number {
  return (content.match(/\b(?:const|let|var)\s+[a-z]{1,2}\b/g) ?? []).length
}

// ─── Classification Functions ────────────────────────────────────────────────

/**
 * Classify piece type from code content
 * @example
 * classifyPieceType('export class Foo {}') // 'king'
 */
export function classifyPieceType(content: string): PieceType {
  const classes = countClasses(content)
  const functions = countFunctions(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)

  if (classes > 0 && exports >= 3) return 'king'
  if (functions > 3 && imports > 1 && exports > 1) return 'queen'
  if (exports > 0 && functions >= 1 && classes === 0 && imports <= 1) return 'rook'
  if (functions > 0 && errors > 0 && classes === 0) return 'bishop'
  if (functions > 0 && classes === 0 && errors === 0 && imports > 0) return 'knight'
  if (loc > 0) return 'pawn'
  return 'pawn'
}

/**
 * Classify rank type from pieces
 * @example
 * classifyRankType([]) // 'ruins'
 */
export function classifyRankType(pieces: ChessPiece[]): RankType {
  if (pieces.length === 0) return 'ruins'
  const n = pieces.length
  const strong = pieces.filter(p => p.condition === 'grandmaster-move' || p.condition === 'strong-position').length
  const hasKing = pieces.some(p => p.pieceType === 'king')
  const hasQueen = pieces.some(p => p.pieceType === 'queen')

  if (strong > n * 0.5 && hasKing) return 'kingside'
  if (strong > n * 0.5 && hasQueen) return 'queenside'
  if (pieces.some(p => p.strategy.isCentralized) && n >= 3) return 'center'
  if (hasKing || hasQueen) return 'flank'
  return 'back-rank'
}

/**
 * Classify rank condition from avg score
 * @example
 * classifyRankCondition(80) // 'winning-position'
 */
export function classifyRankCondition(avgScore: number): RankCondition {
  if (avgScore >= 75) return 'winning-position'
  if (avgScore >= 60) return 'advantage'
  if (avgScore >= 40) return 'equal'
  if (avgScore >= 25) return 'disadvantage'
  if (avgScore >= 10) return 'losing'
  return 'resigned'
}

/**
 * Classify player grade from avg position
 * @example
 * classifyPlayerGrade(85) // 'grandmaster'
 */
export function classifyPlayerGrade(avgPosition: number): PlayerGrade {
  if (avgPosition >= 80) return 'grandmaster'
  if (avgPosition >= 65) return 'master'
  if (avgPosition >= 45) return 'expert'
  if (avgPosition >= 30) return 'intermediate'
  if (avgPosition >= 15) return 'beginner'
  return 'novice'
}

/**
 * Classify piece condition from quality score
 * @example
 * classifyPieceCondition(90) // 'grandmaster-move'
 */
export function classifyPieceCondition(score: number): PieceCondition {
  if (score >= 80) return 'grandmaster-move'
  if (score >= 65) return 'strong-position'
  if (score >= 45) return 'developed'
  if (score >= 25) return 'opening'
  if (score >= 10) return 'blunder'
  return 'checkmate'
}

// ─── Measurement Functions ───────────────────────────────────────────────────

/**
 * Measure position properties from code content
 * @example
 * measurePosition('export function a(): number { return 1 }') // { rank, file, ... }
 */
export function measurePosition(content: string): ChessPiece['position'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const loc = countLoc(content)
  const nesting = maxNesting(content)

  const rank = Math.min(8, Math.max(1, Math.ceil(loc / 10)))
  const file = Math.min(8, Math.max(1, Math.ceil((exports + imports) / 2)))
  const isDeveloped = types > 0 && exports > 0
  const isActive = functions > 0 || exports > 0
  const isPinned = nesting > 3
  const isForked = functions > 1 && exports > 1
  const isDiscovered = imports > 0 && errors === 0 && branches > 0
  const isEnPrise = exports === 0 && loc > 0 && errors === 0
  const squaresControlled = exports + functions + types

  return {
    rank, file, isDeveloped, isActive, isPinned,
    isForked, isDiscovered, isEnPrise, squaresControlled,
  }
}

/**
 * Measure mobility properties from code content
 * @example
 * measureMobility('export function a() {}') // { availableMoves, isMobile, ... }
 */
export function measureMobility(content: string): ChessPiece['mobilityDetail'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const loc = countLoc(content)
  const branches = countBranches(content)

  const availableMoves = exports + functions + imports
  const isMobile = availableMoves >= 3 && types > 0
  const isBlocked = branches > 5 && imports === 0
  const hasEscape = imports > 0 || exports > 0
  const isTrapped = loc > 0 && exports === 0 && imports === 0
  const blockingPieces = Math.max(0, branches - types)

  const moveQuality = Math.min(100, Math.max(0, Math.round(
    (types > 0 ? 30 : 0) +
    (exports > 0 ? 25 : 0) +
    (imports > 0 ? 20 : 0) +
    (isMobile ? 25 : 0),
  )))

  return {
    availableMoves, isMobile, isBlocked,
    hasEscape, isTrapped, blockingPieces, moveQuality,
  }
}

/**
 * Measure tactics properties from code content
 * @example
 * measureTactics('try {} catch(e) {}') // { hasForks, hasPins, ... }
 */
export function measureTactics(content: string): ChessPiece['tactics'] {
  const errors = countErrorHandling(content)
  const branches = countBranches(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const todos = countTodos(content)
  const console = countConsole(content)
  const loc = countLoc(content)

  const hasForks = functions > 1 && branches > 0
  const hasPins = types > 0 && errors > 0
  const hasSkewers = errors >= 2 && branches > 0
  const hasDiscoveredAttacks = functions > 0 && errors > 0 && branches > 0
  const hasSacrifices = errors > 0 && console > 0
  const isUnderAttack = todos > 0
  const isDefended = errors > 0
  const attackSurface = Math.min(100, Math.max(0, Math.round(
    (functions * 10) +
    (branches * 8) +
    (errors * 5) +
    (console * 5),
  )))

  const defenseDepth = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 35 : 0) +
    (types > 0 ? 25 : 0) +
    (isDefended ? 20 : 0) +
    (todos === 0 && loc > 0 ? 20 : 0),
  )))

  return {
    hasForks, hasPins, hasSkewers,
    hasDiscoveredAttacks, hasSacrifices,
    isUnderAttack, isDefended, attackSurface, defenseDepth,
  }
}

/**
 * Measure strategy properties from code content
 * @example
 * measureStrategy('export class Core {}') // { isCentralized, ... }
 */
export function measureStrategy(content: string): ChessPiece['strategy'] {
  const classes = countClasses(content)
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)

  const isCentralized = classes > 0 || (exports >= 3 && imports > 0)
  const isFlanked = imports > 0 && exports > 0 && classes === 0
  const isAdvanced = types > 0 && errors > 0 && functions > 0
  const isRetreated = loc > 0 && exports === 0 && imports === 0
  const hasClearPlan = types > 0 && (functions > 0 || classes > 0)
  const hasInitiative = exports > 1 && errors > 0

  const strategicValue = Math.min(100, Math.max(0, Math.round(
    (isCentralized ? 25 : 0) +
    (hasClearPlan ? 25 : 0) +
    (hasInitiative ? 20 : 0) +
    (isAdvanced ? 15 : 0) +
    (isFlanked ? 15 : 0),
  )))

  return {
    isCentralized, isFlanked, isAdvanced,
    isRetreated, hasClearPlan, hasInitiative, strategicValue,
  }
}

/**
 * Measure coordination properties from code content
 * @example
 * measureCoordination('import { x } from "./a"') // { protectedPieces, ... }
 */
export function measureCoordination(content: string): ChessPiece['coordinationDetail'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const functions = countFunctions(content)
  const comments = countComments(content)
  const jsdoc = countJSDoc(content)
  const types = countTypeAnnotations(content)

  const protectedPieces = exports
  const attackingPieces = imports
  const isSacrificed = exports > 0 && imports === 0 && functions === 0
  const isCoordinated = imports > 0 && exports > 0 && types > 0
  const hasTempo = functions > 0 && comments > 0
  const hasDoubleAttack = functions > 1 && exports > 1

  return {
    protectedPieces, attackingPieces, isSacrificed,
    isCoordinated, hasTempo, hasDoubleAttack,
  }
}

/**
 * Measure endgame properties from code content
 * @example
 * measureEndgame('export function a(): number { return 1 }') // { isPromotable, ... }
 */
export function measureEndgame(content: string): ChessPiece['endgame'] {
  const exports = countExports(content)
  const imports = countImports(content)
  const types = countTypeAnnotations(content)
  const errors = countErrorHandling(content)
  const loc = countLoc(content)
  const todos = countTodos(content)
  const classes = countClasses(content)
  const descriptive = countDescriptiveNames(content)

  const functions = countFunctions(content)
  const isPromotable = types > 0 && exports > 0 && errors > 0
  const isPassed = exports > 0 && imports === 0
  const isConnected = imports > 0 && exports > 0
  const isIsolated = imports === 0 && exports === 0 && loc > 0
  const isDoubled = exports > 2 && functions === 0 && classes === 0
  const isBackward = loc > 0 && types === 0 && errors === 0

  const pawnStructure = Math.min(100, Math.max(0, Math.round(
    (isPromotable ? 25 : 0) +
    (isConnected ? 20 : 0) +
    (isPassed ? 15 : 0) +
    (!isIsolated ? 15 : 0) +
    (!isDoubled ? 10 : 0) +
    (descriptive > 0 ? 15 : 0),
  )))

  const kingSafety = Math.min(100, Math.max(0, Math.round(
    (errors > 0 ? 30 : 0) +
    (types > 0 ? 25 : 0) +
    (todos === 0 && loc > 0 ? 20 : 0) +
    (classes > 0 ? 15 : 0) +
    (exports > 0 ? 10 : 0),
  )))

  return {
    isPromotable, isPassed, isConnected,
    isIsolated, isDoubled, isBackward,
    pawnStructure, kingSafety,
  }
}

// ─── Core Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a single file as a chess piece
 * @example
 * analyzeChessPiece('export function a(): number { return 1 }', 'a.ts') // ChessPiece
 */
export function analyzeChessPiece(content: string, filePath: string): ChessPiece {
  const loc = countLoc(content)
  if (loc === 0) {
    return {
      file: filePath,
      pieceType: 'pawn',
      mobility: 0, boardControl: 0, tacticalStrength: 0,
      strategicDepth: 0, coordination: 0, endgameStability: 0,
      position: { rank: 1, file: 1, isDeveloped: false, isActive: false, isPinned: false, isForked: false, isDiscovered: false, isEnPrise: false, squaresControlled: 0 },
      mobilityDetail: { availableMoves: 0, isMobile: false, isBlocked: false, hasEscape: false, isTrapped: true, blockingPieces: 0, moveQuality: 0 },
      tactics: { hasForks: false, hasPins: false, hasSkewers: false, hasDiscoveredAttacks: false, hasSacrifices: false, isUnderAttack: false, isDefended: false, attackSurface: 0, defenseDepth: 0 },
      strategy: { isCentralized: false, isFlanked: false, isAdvanced: false, isRetreated: false, hasClearPlan: false, hasInitiative: false, strategicValue: 0 },
      coordinationDetail: { protectedPieces: 0, attackingPieces: 0, isSacrificed: false, isCoordinated: false, hasTempo: false, hasDoubleAttack: false },
      endgame: { isPromotable: false, isPassed: false, isConnected: false, isIsolated: false, isDoubled: false, isBackward: false, pawnStructure: 0, kingSafety: 0 },
      condition: 'checkmate',
      qualityScore: 0,
    }
  }

  const pieceType = classifyPieceType(content)
  const position = measurePosition(content)
  const mobilityReading = measureMobility(content)
  const tactics = measureTactics(content)
  const strategy = measureStrategy(content)
  const coordinationReading = measureCoordination(content)
  const endgameReading = measureEndgame(content)

  const mobility = mobilityReading.moveQuality
  const boardControl = Math.min(100, Math.max(0, Math.round(
    position.squaresControlled * 5 +
    (position.isActive ? 20 : 0) +
    (position.isDeveloped ? 25 : 0),
  )))
  const tacticalStrength = tactics.defenseDepth
  const strategicDepth = strategy.strategicValue
  const coordination = Math.min(100, Math.max(0, Math.round(
    (coordinationReading.isCoordinated ? 30 : 0) +
    (coordinationReading.hasTempo ? 25 : 0) +
    (coordinationReading.hasDoubleAttack ? 20 : 0) +
    (coordinationReading.protectedPieces > 0 ? 15 : 0) +
    (coordinationReading.attackingPieces > 0 ? 10 : 0),
  )))
  const endgameStability = Math.min(100, Math.max(0, Math.round(
    endgameReading.pawnStructure * 0.5 +
    endgameReading.kingSafety * 0.5,
  )))

  const qualityScore = Math.min(100, Math.max(0, Math.round(
    mobility * 0.15 +
    boardControl * 0.15 +
    tacticalStrength * 0.2 +
    strategicDepth * 0.2 +
    coordination * 0.15 +
    endgameStability * 0.15,
  )))

  const condition = classifyPieceCondition(qualityScore)

  return {
    file: filePath,
    pieceType,
    mobility, boardControl, tacticalStrength,
    strategicDepth, coordination, endgameStability,
    position, mobilityDetail: mobilityReading,
    tactics, strategy,
    coordinationDetail: coordinationReading,
    endgame: endgameReading,
    condition, qualityScore,
  }
}

// ─── Rank Analysis ───────────────────────────────────────────────────────────

/**
 * Analyze a directory as a chess rank
 * @example
 * analyzeChessRank(pieces, 'src') // ChessRank
 */
export function analyzeChessRank(pieces: ChessPiece[], dirPath: string): ChessRank {
  if (pieces.length === 0) {
    return {
      directory: dirPath, pieces: [],
      avgMobility: 0, avgTacticalStrength: 0,
      avgStrategicDepth: 0, avgCoordination: 0,
      grandmasterCount: 0, blunderCount: 0, checkmateCount: 0,
      rankType: 'ruins', condition: 'resigned',
    }
  }

  const n = pieces.length
  const avgMobility = Math.round(pieces.reduce((s, p) => s + p.mobility, 0) / n)
  const avgTacticalStrength = Math.round(pieces.reduce((s, p) => s + p.tacticalStrength, 0) / n)
  const avgStrategicDepth = Math.round(pieces.reduce((s, p) => s + p.strategicDepth, 0) / n)
  const avgCoordination = Math.round(pieces.reduce((s, p) => s + p.coordination, 0) / n)
  const grandmasterCount = pieces.filter(p => p.condition === 'grandmaster-move' || p.condition === 'strong-position').length
  const blunderCount = pieces.filter(p => p.condition === 'blunder').length
  const checkmateCount = pieces.filter(p => p.condition === 'checkmate').length

  const rankType = classifyRankType(pieces)
  const avgScore = Math.round(pieces.reduce((s, p) => s + p.qualityScore, 0) / n)
  const condition = classifyRankCondition(avgScore)

  return {
    directory: dirPath, pieces,
    avgMobility, avgTacticalStrength, avgStrategicDepth, avgCoordination,
    grandmasterCount, blunderCount, checkmateCount,
    rankType, condition,
  }
}

// ─── Recommendations ─────────────────────────────────────────────────────────

/**
 * Generate chess board recommendations
 * @example
 * generateRecommendations(pieces, ranks, game, stats) // string[]
 */
export function generateRecommendations(
  _pieces: ChessPiece[],
  _ranks: ChessRank[],
  _game: ChessGame,
  stats: ChessBoardStats,
): string[] {
  void _pieces
  void _ranks
  void _game
  const recs: string[] = []

  if (stats.checkmateCount > 0) {
    recs.push(`Checkmate positions: ${stats.checkmateCount} files are critically problematic`)
  }
  if (stats.pinnedPieces > 3) {
    recs.push(`Pinned pieces: ${stats.pinnedPieces} files are overly constrained by deep nesting`)
  }
  if (stats.overallPosition >= 60) {
    recs.push('Strong position: codebase shows good strategic positioning')
  }
  if (stats.isolatedPieces > stats.totalFiles * 0.3) {
    recs.push('Too many isolated pieces: consider better module integration')
  }
  if (stats.kingCount === 0 && stats.totalFiles > 0) {
    recs.push('No king files: consider adding core architectural modules')
  }

  return Array.from(new Set(recs))
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Build complete chess board result from files and contents
 * @example
 * buildChessBoardResult(['a.ts'], ['export function a() {}'], {}) // ChessBoardResult
 */
export function buildChessBoardResult(
  files: string[],
  contents: string[],
  options: Record<string, unknown>,
): ChessBoardResult {
  void options

  const pieces: ChessPiece[] = files.map((file, i) => {
    const content = contents[i] ?? ''
    try {
      return analyzeChessPiece(content, file)
    } catch {
      return analyzeChessPiece('', file)
    }
  })

  const dirMap = new Map<string, ChessPiece[]>()
  for (const piece of pieces) {
    const dir = piece.file.includes('/') ? piece.file.slice(0, piece.file.lastIndexOf('/')) : '.'
    const existing = dirMap.get(dir)
    if (existing) { existing.push(piece) } else { dirMap.set(dir, [piece]) }
  }

  const ranks: ChessRank[] = Array.from(dirMap.entries()).map(([dir, ps]) =>
    analyzeChessRank(ps, dir),
  )

  const n = pieces.length || 1
  const avgMobility = Math.round(pieces.reduce((s, p) => s + p.mobility, 0) / n)
  const avgTacticalStrength = Math.round(pieces.reduce((s, p) => s + p.tacticalStrength, 0) / n)
  const avgStrategicDepth = Math.round(pieces.reduce((s, p) => s + p.strategicDepth, 0) / n)
  const avgCoordination = Math.round(pieces.reduce((s, p) => s + p.coordination, 0) / n)
  const avgEndgameStability = Math.round(pieces.reduce((s, p) => s + p.endgameStability, 0) / n)

  const overallPosition = Math.min(100, Math.max(0, Math.round(
    avgMobility * 0.2 +
    avgTacticalStrength * 0.2 +
    avgStrategicDepth * 0.2 +
    avgCoordination * 0.2 +
    avgEndgameStability * 0.2,
  )))

  const isWinning = overallPosition >= 50

  const game: ChessGame = {
    avgMobility, avgTacticalStrength, avgStrategicDepth,
    avgCoordination, avgEndgameStability, isWinning, overallPosition,
  }

  const stats: ChessBoardStats = {
    totalFiles: files.length,
    totalRanks: ranks.length,
    avgMobility,
    avgBoardControl: Math.round(pieces.reduce((s, p) => s + p.boardControl, 0) / n),
    avgTacticalStrength,
    avgStrategicDepth,
    avgCoordination,
    avgEndgameStability,
    kingCount: pieces.filter(p => p.pieceType === 'king').length,
    queenCount: pieces.filter(p => p.pieceType === 'queen').length,
    rookCount: pieces.filter(p => p.pieceType === 'rook').length,
    bishopCount: pieces.filter(p => p.pieceType === 'bishop').length,
    knightCount: pieces.filter(p => p.pieceType === 'knight').length,
    pawnCount: pieces.filter(p => p.pieceType === 'pawn').length,
    grandmasterMoveCount: pieces.filter(p => p.condition === 'grandmaster-move').length,
    strongPositionCount: pieces.filter(p => p.condition === 'strong-position').length,
    developedCount: pieces.filter(p => p.condition === 'developed').length,
    openingCount: pieces.filter(p => p.condition === 'opening').length,
    blunderCount: pieces.filter(p => p.condition === 'blunder').length,
    checkmateCount: pieces.filter(p => p.condition === 'checkmate').length,
    developedPieces: pieces.filter(p => p.position.isDeveloped).length,
    activePieces: pieces.filter(p => p.position.isActive).length,
    pinnedPieces: pieces.filter(p => p.position.isPinned).length,
    trappedPieces: pieces.filter(p => p.mobilityDetail.isTrapped).length,
    defendedPieces: pieces.filter(p => p.tactics.isDefended).length,
    underAttackPieces: pieces.filter(p => p.tactics.isUnderAttack).length,
    centralizedPieces: pieces.filter(p => p.strategy.isCentralized).length,
    isolatedPieces: pieces.filter(p => p.endgame.isIsolated).length,
    promotablePieces: pieces.filter(p => p.endgame.isPromotable).length,
    hasClearPlanCount: pieces.filter(p => p.strategy.hasClearPlan).length,
    overallPosition,
    playerGrade: classifyPlayerGrade(overallPosition),
    bestPosition: pieces.length > 0
      ? pieces.reduce((a, b) => b.qualityScore > a.qualityScore ? b : a, pieces[0]).file : 'none',
    worstPosition: pieces.length > 0
      ? pieces.reduce((a, b) => b.qualityScore < a.qualityScore ? b : a, pieces[0]).file : 'none',
    mostPowerful: pieces.length > 0
      ? pieces.reduce((a, b) => b.tacticalStrength > a.tacticalStrength ? b : a, pieces[0]).file : 'none',
    mostStrategic: pieces.length > 0
      ? pieces.reduce((a, b) => b.strategicDepth > a.strategicDepth ? b : a, pieces[0]).file : 'none',
    mostCoordinated: pieces.length > 0
      ? pieces.reduce((a, b) => b.coordination > a.coordination ? b : a, pieces[0]).file : 'none',
  }

  const recommendations = generateRecommendations(pieces, ranks, game, stats)

  return { pieces, ranks, game, stats, recommendations }
}
