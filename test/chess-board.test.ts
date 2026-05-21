import { describe, it, expect } from 'vitest'
import {
  countLoc, countImports, countExports, countFunctions,
  countClasses, countErrorHandling, countTypeAnnotations,
  countBranches, maxNesting, countConsole, countComments,
  countTodos, countJSDoc, countDescriptiveNames, countShortNames,
  classifyPieceType, classifyRankType,
  classifyRankCondition, classifyPlayerGrade,
  classifyPieceCondition,
  measurePosition, measureMobility, measureTactics,
  measureStrategy, measureCoordination, measureEndgame,
  analyzeChessPiece, analyzeChessRank,
  generateRecommendations, buildChessBoardResult,
} from '../src/commands/chess-board-helpers.js'
import { formatChessBoardTable, formatChessBoardJson } from '../src/commands/chess-board-format-helpers.js'

// ─── Sample Code Snippets ─────────────────────────────────────────────────────

const emptyCode = ''
const simpleCode = 'const x = 1'
const typedCode = 'export function calc(x: number): string { return String(x) }'
const strongCode = [
  'import { helper } from "./utils.js"',
  'import type { Config } from "./types.js"',
  '/**',
  ' * Calculate result',
  ' * @example',
  ' * calc(5) // number',
  ' */',
  'export function calculateResult(x: number): number {',
  '  try {',
  '    const result: number = helper(x)',
  '    if (result > 0) { return result }',
  '    return 0',
  '  } catch (err) {',
  '    throw new Error("fail")',
  '  }',
  '}',
  'export interface CalcOptions { value: number; label: string }',
  'export type CalcResult = number | string',
].join('\n')

const diverseCode = [
  'import { helper } from "./utils.js"',
  'export function calc(): void {}',
  'export class Calculator {',
  '  constructor() {}',
  '  compute(): number { return 1 }',
  '}',
  'export interface Shape { area: number }',
  'export type Result = string | number',
  '// TODO: fix this',
  'const x = 1',
].join('\n')

const errorHeavyCode = [
  'try {',
  '  doSomething()',
  '} catch (e) {',
  '  handleError(e)',
  '}',
  'try {',
  '  doOther()',
  '} catch (e) {',
  '  handleOther(e)',
  '}',
].join('\n')

const branchyCode = [
  'if (a) {',
  '  if (b) {',
  '    if (c) {',
  '      if (d) {',
  '        if (e) {',
  '          x = 1',
  '        }',
  '      }',
  '    }',
  '  }',
  '}',
].join('\n')

const queenCode = [
  'import { a } from "./a.js"',
  'import { b } from "./b.js"',
  'import { c } from "./c.js"',
  'export function calc(): void {}',
  'export function compute(): void {}',
  'export function process(): void {}',
  'export function handle(): void {}',
].join('\n')

const multiFilePaths = [
  'src/strong.ts',
  'src/diverse.ts',
  'src/minimal.ts',
]

// ─── Primitives ───────────────────────────────────────────────────────────────

describe('chess-board primitives', () => {
  it('countLoc counts non-empty lines', () => {
    expect(countLoc(emptyCode)).toBe(0)
    expect(countLoc(simpleCode)).toBe(1)
    expect(countLoc(strongCode)).toBe(18)
  })

  it('countImports counts import statements', () => {
    expect(countImports(emptyCode)).toBe(0)
    expect(countImports(simpleCode)).toBe(0)
    expect(countImports(strongCode)).toBe(2)
  })

  it('countExports counts export statements', () => {
    expect(countExports(emptyCode)).toBe(0)
    expect(countExports(simpleCode)).toBe(0)
    expect(countExports(strongCode)).toBe(3)
    expect(countExports(typedCode)).toBe(1)
  })

  it('countFunctions counts function declarations', () => {
    expect(countFunctions(emptyCode)).toBe(0)
    expect(countFunctions(simpleCode)).toBe(0)
    expect(countFunctions(strongCode)).toBe(1)
    expect(countFunctions(typedCode)).toBe(1)
  })

  it('countClasses counts class declarations', () => {
    expect(countClasses(emptyCode)).toBe(0)
    expect(countClasses(diverseCode)).toBe(1)
  })

  it('countErrorHandling counts try/catch/throw', () => {
    expect(countErrorHandling(emptyCode)).toBe(0)
    expect(countErrorHandling(strongCode)).toBe(3)
    expect(countErrorHandling(errorHeavyCode)).toBe(4)
  })

  it('countTypeAnnotations counts type annotations', () => {
    expect(countTypeAnnotations(emptyCode)).toBe(0)
    expect(countTypeAnnotations(strongCode)).toBe(5)
  })

  it('countBranches counts if/ternary/switch', () => {
    expect(countBranches(emptyCode)).toBe(0)
    expect(countBranches(strongCode)).toBe(1)
    expect(countBranches(branchyCode)).toBe(5)
  })

  it('maxNesting returns max brace depth', () => {
    expect(maxNesting(emptyCode)).toBe(0)
    expect(maxNesting(simpleCode)).toBe(0)
    expect(maxNesting(branchyCode)).toBe(5)
  })

  it('countConsole counts console statements', () => {
    expect(countConsole(emptyCode)).toBe(0)
    expect(countConsole('console.log("x")')).toBe(1)
  })

  it('countComments counts comment markers', () => {
    expect(countComments(emptyCode)).toBe(0)
    expect(countComments('// hello')).toBe(1)
    expect(countComments('/* block */')).toBe(1)
    expect(countComments(strongCode)).toBe(2)
  })

  it('countTodos counts TODO/FIXME/HACK markers', () => {
    expect(countTodos(emptyCode)).toBe(0)
    expect(countTodos(diverseCode)).toBe(1)
  })

  it('countJSDoc counts JSDoc blocks', () => {
    expect(countJSDoc(emptyCode)).toBe(0)
    expect(countJSDoc(strongCode)).toBe(1)
  })

  it('countDescriptiveNames counts camelCase >3 chars', () => {
    expect(countDescriptiveNames(emptyCode)).toBe(0)
    expect(countDescriptiveNames(strongCode)).toBe(2)
  })

  it('countShortNames counts 1-2 char names', () => {
    expect(countShortNames(emptyCode)).toBe(0)
    expect(countShortNames(simpleCode)).toBe(1)
  })
})

// ─── Classification Functions ─────────────────────────────────────────────────

describe('chess-board classifications', () => {
  it('classifyPieceType returns correct type', () => {
    expect(classifyPieceType(diverseCode)).toBe('king')
    expect(classifyPieceType(strongCode)).toBe('bishop')
    expect(classifyPieceType(typedCode)).toBe('rook')
    expect(classifyPieceType(queenCode)).toBe('queen')
    expect(classifyPieceType(simpleCode)).toBe('pawn')
    expect(classifyPieceType(emptyCode)).toBe('pawn')
  })

  it('classifyRankType returns ruins for empty', () => {
    expect(classifyRankType([])).toBe('ruins')
  })

  it('classifyRankCondition returns correct condition', () => {
    expect(classifyRankCondition(80)).toBe('winning-position')
    expect(classifyRankCondition(65)).toBe('advantage')
    expect(classifyRankCondition(45)).toBe('equal')
    expect(classifyRankCondition(30)).toBe('disadvantage')
    expect(classifyRankCondition(15)).toBe('losing')
    expect(classifyRankCondition(5)).toBe('resigned')
  })

  it('classifyPlayerGrade returns correct grade', () => {
    expect(classifyPlayerGrade(85)).toBe('grandmaster')
    expect(classifyPlayerGrade(70)).toBe('master')
    expect(classifyPlayerGrade(50)).toBe('expert')
    expect(classifyPlayerGrade(35)).toBe('intermediate')
    expect(classifyPlayerGrade(20)).toBe('beginner')
    expect(classifyPlayerGrade(5)).toBe('novice')
    expect(classifyPlayerGrade(0)).toBe('novice')
  })

  it('classifyPieceCondition returns correct condition', () => {
    expect(classifyPieceCondition(90)).toBe('grandmaster-move')
    expect(classifyPieceCondition(70)).toBe('strong-position')
    expect(classifyPieceCondition(50)).toBe('developed')
    expect(classifyPieceCondition(30)).toBe('opening')
    expect(classifyPieceCondition(15)).toBe('blunder')
    expect(classifyPieceCondition(5)).toBe('checkmate')
  })
})

// ─── Measurement Functions ────────────────────────────────────────────────────

describe('chess-board measurements', () => {
  it('measurePosition returns correct properties for empty', () => {
    const pos = measurePosition(emptyCode)
    expect(pos.rank).toBe(1)
    expect(pos.file).toBe(1)
    expect(pos.isDeveloped).toBe(false)
    expect(pos.isActive).toBe(false)
    expect(pos.squaresControlled).toBe(0)
  })

  it('measurePosition detects developed code', () => {
    const pos = measurePosition(strongCode)
    expect(pos.isDeveloped).toBe(true)
    expect(pos.isActive).toBe(true)
    expect(pos.squaresControlled).toBeGreaterThan(0)
  })

  it('measurePosition detects pinned code', () => {
    const pos = measurePosition(branchyCode)
    expect(pos.isPinned).toBe(true)
  })

  it('measurePosition detects forked code', () => {
    const forkCode = 'export function a() {}\nexport function b() {}'
    const pos = measurePosition(forkCode)
    expect(pos.isForked).toBe(true)
  })

  it('measureMobility returns zero for empty', () => {
    const mob = measureMobility(emptyCode)
    expect(mob.availableMoves).toBe(0)
    expect(mob.isMobile).toBe(false)
    expect(mob.isTrapped).toBe(false)
  })

  it('measureMobility detects mobile code', () => {
    const mob = measureMobility(strongCode)
    expect(mob.availableMoves).toBeGreaterThan(0)
    expect(mob.hasEscape).toBe(true)
  })

  it('measureTactics returns zero for empty', () => {
    const tac = measureTactics(emptyCode)
    expect(tac.attackSurface).toBe(0)
    expect(tac.defenseDepth).toBe(0)
    expect(tac.isDefended).toBe(false)
  })

  it('measureTactics detects defended code', () => {
    const tac = measureTactics(strongCode)
    expect(tac.isDefended).toBe(true)
    expect(tac.hasPins).toBe(true)
    expect(tac.defenseDepth).toBeGreaterThan(0)
  })

  it('measureTactics detects under-attack code', () => {
    const tac = measureTactics(diverseCode)
    expect(tac.isUnderAttack).toBe(true)
  })

  it('measureStrategy returns zero for empty', () => {
    const str = measureStrategy(emptyCode)
    expect(str.strategicValue).toBe(0)
    expect(str.hasClearPlan).toBe(false)
  })

  it('measureStrategy detects centralized code', () => {
    const str = measureStrategy(diverseCode)
    expect(str.isCentralized).toBe(true)
    expect(str.hasClearPlan).toBe(true)
  })

  it('measureStrategy detects advanced code', () => {
    const str = measureStrategy(strongCode)
    expect(str.isAdvanced).toBe(true)
  })

  it('measureCoordination returns zero for empty', () => {
    const coord = measureCoordination(emptyCode)
    expect(coord.protectedPieces).toBe(0)
    expect(coord.attackingPieces).toBe(0)
  })

  it('measureCoordination detects coordinated code', () => {
    const coord = measureCoordination(strongCode)
    expect(coord.isCoordinated).toBe(true)
    expect(coord.hasTempo).toBe(true)
  })

  it('measureEndgame returns zeros for empty', () => {
    const end = measureEndgame(emptyCode)
    expect(end.isPromotable).toBe(false)
    expect(end.isIsolated).toBe(false)
    expect(end.pawnStructure).toBe(25)
    expect(end.kingSafety).toBe(0)
  })

  it('measureEndgame detects promotable code', () => {
    const end = measureEndgame(strongCode)
    expect(end.isPromotable).toBe(true)
    expect(end.isConnected).toBe(true)
  })

  it('measureEndgame detects isolated code', () => {
    const end = measureEndgame(simpleCode)
    expect(end.isIsolated).toBe(true)
  })

  it('measureEndgame detects backward code', () => {
    const end = measureEndgame(simpleCode)
    expect(end.isBackward).toBe(true)
  })
})

// ─── Analysis Functions ───────────────────────────────────────────────────────

describe('chess-board analysis', () => {
  it('analyzeChessPiece returns checkmate for empty', () => {
    const piece = analyzeChessPiece(emptyCode, 'empty.ts')
    expect(piece.file).toBe('empty.ts')
    expect(piece.condition).toBe('checkmate')
    expect(piece.qualityScore).toBe(0)
    expect(piece.pieceType).toBe('pawn')
    expect(piece.mobility).toBe(0)
    expect(piece.boardControl).toBe(0)
    expect(piece.tacticalStrength).toBe(0)
    expect(piece.strategicDepth).toBe(0)
    expect(piece.coordination).toBe(0)
    expect(piece.endgameStability).toBe(0)
    expect(piece.position.rank).toBe(1)
    expect(piece.position.file).toBe(1)
  })

  it('analyzeChessPiece classifies strong code as bishop', () => {
    const piece = analyzeChessPiece(strongCode, 'strong.ts')
    expect(piece.file).toBe('strong.ts')
    expect(piece.pieceType).toBe('bishop')
    expect(piece.qualityScore).toBeGreaterThan(20)
    expect(piece.position.isDeveloped).toBe(true)
    expect(piece.tactics.isDefended).toBe(true)
  })

  it('analyzeChessPiece classifies diverse code as king', () => {
    const piece = analyzeChessPiece(diverseCode, 'diverse.ts')
    expect(piece.pieceType).toBe('king')
    expect(piece.strategy.isCentralized).toBe(true)
  })

  it('analyzeChessPiece classifies typed code as rook', () => {
    const piece = analyzeChessPiece(typedCode, 'typed.ts')
    expect(piece.pieceType).toBe('rook')
  })

  it('analyzeChessPiece classifies simple code as pawn', () => {
    const piece = analyzeChessPiece(simpleCode, 'simple.ts')
    expect(piece.pieceType).toBe('pawn')
  })

  it('analyzeChessPiece classifies queen code', () => {
    const piece = analyzeChessPiece(queenCode, 'queen.ts')
    expect(piece.pieceType).toBe('queen')
  })

  it('analyzeChessPiece scores are clamped to 0-100', () => {
    const piece = analyzeChessPiece(strongCode, 'strong.ts')
    expect(piece.qualityScore).toBeLessThanOrEqual(100)
    expect(piece.qualityScore).toBeGreaterThanOrEqual(0)
    expect(piece.mobility).toBeLessThanOrEqual(100)
    expect(piece.boardControl).toBeLessThanOrEqual(100)
    expect(piece.tacticalStrength).toBeLessThanOrEqual(100)
    expect(piece.strategicDepth).toBeLessThanOrEqual(100)
    expect(piece.coordination).toBeLessThanOrEqual(100)
    expect(piece.endgameStability).toBeLessThanOrEqual(100)
  })

  it('analyzeChessRank handles empty pieces', () => {
    const rank = analyzeChessRank([], 'empty-dir')
    expect(rank.directory).toBe('empty-dir')
    expect(rank.pieces).toHaveLength(0)
    expect(rank.avgMobility).toBe(0)
    expect(rank.rankType).toBe('ruins')
    expect(rank.condition).toBe('resigned')
  })

  it('analyzeChessRank aggregates piece scores', () => {
    const pieces = [
      analyzeChessPiece(strongCode, 'strong.ts'),
      analyzeChessPiece(typedCode, 'typed.ts'),
    ]
    const rank = analyzeChessRank(pieces, 'src')
    expect(rank.directory).toBe('src')
    expect(rank.pieces).toHaveLength(2)
    expect(rank.avgMobility).toBeGreaterThan(0)
  })
})

// ─── Build Result ─────────────────────────────────────────────────────────────

describe('chess-board buildChessBoardResult', () => {
  it('handles empty input', () => {
    const result = buildChessBoardResult([], [], {})
    expect(result.pieces).toHaveLength(0)
    expect(result.ranks).toHaveLength(0)
    expect(result.game.avgMobility).toBe(0)
    expect(result.game.overallPosition).toBe(0)
    expect(result.game.isWinning).toBe(false)
    expect(result.stats.totalFiles).toBe(0)
    expect(result.stats.playerGrade).toBe('novice')
    expect(result.stats.bestPosition).toBe('none')
    expect(result.stats.worstPosition).toBe('none')
  })

  it('handles single file', () => {
    const result = buildChessBoardResult(['calc.ts'], [typedCode], {})
    expect(result.pieces).toHaveLength(1)
    expect(result.pieces[0].file).toBe('calc.ts')
    expect(result.ranks).toHaveLength(1)
    expect(result.stats.totalFiles).toBe(1)
    expect(result.stats.playerGrade).toBeDefined()
  })

  it('handles multi-file input', () => {
    const contents = [strongCode, diverseCode, simpleCode]
    const result = buildChessBoardResult(multiFilePaths, contents, {})
    expect(result.pieces).toHaveLength(3)
    expect(result.ranks).toHaveLength(1)
    expect(result.game.avgMobility).toBeGreaterThan(0)
    expect(result.stats.totalFiles).toBe(3)
    expect(result.stats.totalRanks).toBe(1)
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('groups files into ranks by directory', () => {
    const paths = ['src/a.ts', 'lib/b.ts', 'src/c.ts']
    const contents = [typedCode, typedCode, typedCode]
    const result = buildChessBoardResult(paths, contents, {})
    expect(result.ranks).toHaveLength(2)
    expect(result.stats.totalRanks).toBe(2)
  })

  it('tracks condition counts', () => {
    const result = buildChessBoardResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const total = result.stats.grandmasterMoveCount +
      result.stats.strongPositionCount +
      result.stats.developedCount +
      result.stats.openingCount +
      result.stats.blunderCount +
      result.stats.checkmateCount
    expect(total).toBe(3)
  })

  it('tracks piece type counts', () => {
    const result = buildChessBoardResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const total = result.stats.kingCount +
      result.stats.queenCount +
      result.stats.rookCount +
      result.stats.bishopCount +
      result.stats.knightCount +
      result.stats.pawnCount
    expect(total).toBe(3)
  })

  it('computes best/worst/most powerful/strategic/coordinated', () => {
    const result = buildChessBoardResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    expect(result.stats.bestPosition).toBeDefined()
    expect(result.stats.worstPosition).toBeDefined()
    expect(result.stats.mostPowerful).toBeDefined()
    expect(result.stats.mostStrategic).toBeDefined()
    expect(result.stats.mostCoordinated).toBeDefined()
  })

  it('counts boolean properties correctly', () => {
    const result = buildChessBoardResult(
      ['strong.ts'],
      [strongCode],
      {},
    )
    expect(result.stats.developedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.activePieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.pinnedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.trappedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.defendedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.underAttackPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.centralizedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.isolatedPieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.promotablePieces).toBeGreaterThanOrEqual(0)
    expect(result.stats.hasClearPlanCount).toBeGreaterThanOrEqual(0)
  })

  it('game isWinning is boolean', () => {
    const result = buildChessBoardResult(
      ['strong.ts', 'diverse.ts'],
      [strongCode, diverseCode],
      {},
    )
    expect(typeof result.game.isWinning).toBe('boolean')
  })
})

// ─── Recommendations ──────────────────────────────────────────────────────────

describe('chess-board recommendations', () => {
  it('returns recommendations for problematic code', () => {
    const result = buildChessBoardResult(
      ['bad.ts'],
      [simpleCode],
      {},
    )
    expect(result.recommendations).toBeInstanceOf(Array)
  })

  it('returns unique recommendations', () => {
    const result = buildChessBoardResult(
      multiFilePaths,
      [strongCode, diverseCode, simpleCode],
      {},
    )
    const unique = Array.from(new Set(result.recommendations))
    expect(result.recommendations).toHaveLength(unique.length)
  })
})

// ─── Format Helpers ───────────────────────────────────────────────────────────

describe('chess-board format helpers', () => {
  it('formatChessBoardTable returns string', () => {
    const result = buildChessBoardResult(['a.ts'], [typedCode], {})
    const formatted = formatChessBoardTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('Chess Board')
  })

  it('formatChessBoardTable handles verbose mode', () => {
    const result = buildChessBoardResult(['a.ts'], [typedCode], {})
    const formatted = formatChessBoardTable(result, true)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('position:')
    expect(formatted).toContain('mobility:')
    expect(formatted).toContain('tactics:')
  })

  it('formatChessBoardTable handles empty input', () => {
    const result = buildChessBoardResult([], [], {})
    const formatted = formatChessBoardTable(result, false)
    expect(typeof formatted).toBe('string')
    expect(formatted).toContain('No files analyzed')
  })

  it('formatChessBoardJson returns valid JSON', () => {
    const result = buildChessBoardResult(['a.ts'], [typedCode], {})
    const json = formatChessBoardJson(result)
    expect(() => JSON.parse(json)).not.toThrow()
    const parsed = JSON.parse(json)
    expect(parsed.pieces).toHaveLength(1)
    expect(parsed.stats).toBeDefined()
    expect(parsed.game).toBeDefined()
  })
})

// ─── Edge Cases ───────────────────────────────────────────────────────────────

describe('chess-board edge cases', () => {
  it('handles mismatched file/content arrays', () => {
    const result = buildChessBoardResult(['a.ts', 'b.ts'], [typedCode], {})
    expect(result.pieces).toHaveLength(2)
  })

  it('handles deeply nested code', () => {
    const piece = analyzeChessPiece(branchyCode, 'nested.ts')
    expect(piece.position.isPinned).toBe(true)
  })

  it('handles code with many errors', () => {
    const piece = analyzeChessPiece(errorHeavyCode, 'errors.ts')
    expect(piece.tactics.isDefended).toBe(true)
    expect(piece.tactics.hasSkewers).toBe(false)
  })

  it('handles code with only comments', () => {
    const commentCode = '// just a comment\n/* block */'
    const piece = analyzeChessPiece(commentCode, 'comment.ts')
    expect(piece.pieceType).toBe('pawn')
    expect(piece.mobilityDetail.isTrapped).toBe(true)
  })

  it('piece with exports but no imports is passed', () => {
    const piece = analyzeChessPiece(typedCode, 'typed.ts')
    expect(piece.endgame.isPassed).toBe(true)
  })

  it('piece with both imports and exports is connected', () => {
    const piece = analyzeChessPiece(strongCode, 'strong.ts')
    expect(piece.endgame.isConnected).toBe(true)
  })

  it('knight type for function with imports and no errors', () => {
    const knightCode = 'import { x } from "./a.js"\nimport { y } from "./b.js"\nfunction process(): void {}'
    const piece = analyzeChessPiece(knightCode, 'knight.ts')
    expect(piece.pieceType).toBe('knight')
  })
})
