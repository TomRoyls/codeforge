import chalk from 'chalk'
import type { ChessPiece, ChessRank, ChessBoardResult } from './chess-board-helpers.js'

// ─── Color Utilities ─────────────────────────────────────────────────────────

function scoreColor(s: number): string {
  if (s >= 70) return chalk.green(String(s))
  if (s >= 40) return chalk.yellow(String(s))
  return chalk.red(String(s))
}

function pieceColor(t: string): string {
  switch (t) {
    case 'king': return chalk.rgb(255, 215, 0)(t)
    case 'queen': return chalk.magenta(t)
    case 'rook': return chalk.blue(t)
    case 'bishop': return chalk.cyan(t)
    case 'knight': return chalk.green(t)
    case 'pawn': return chalk.dim(t)
    default: return t
  }
}

function conditionColor(c: string): string {
  switch (c) {
    case 'grandmaster-move': return chalk.rgb(255, 215, 0)(c)
    case 'strong-position': return chalk.green(c)
    case 'developed': return chalk.blue(c)
    case 'opening': return chalk.cyan(c)
    case 'blunder': return chalk.yellow(c)
    case 'checkmate': return chalk.red(c)
    default: return chalk.dim(c)
  }
}

function rankTypeColor(t: string): string {
  switch (t) {
    case 'kingside': return chalk.rgb(255, 215, 0)(t)
    case 'queenside': return chalk.magenta(t)
    case 'center': return chalk.green(t)
    case 'flank': return chalk.blue(t)
    case 'back-rank': return chalk.yellow(t)
    case 'ruins': return chalk.red(t)
    default: return chalk.dim(t)
  }
}

function rankConditionColor(c: string): string {
  switch (c) {
    case 'winning-position': return chalk.rgb(255, 215, 0)(c)
    case 'advantage': return chalk.green(c)
    case 'equal': return chalk.blue(c)
    case 'disadvantage': return chalk.yellow(c)
    case 'losing': return chalk.red(c)
    case 'resigned': return chalk.dim(c)
    default: return c
  }
}

function gradeColor(g: string): string {
  switch (g) {
    case 'grandmaster': return chalk.rgb(255, 215, 0)(g)
    case 'master': return chalk.green(g)
    case 'expert': return chalk.blue(g)
    case 'intermediate': return chalk.cyan(g)
    case 'beginner': return chalk.yellow(g)
    case 'novice': return chalk.red(g)
    default: return chalk.dim(g)
  }
}

// ─── Piece Formatting ────────────────────────────────────────────────────────

function formatPiece(piece: ChessPiece, verbose: boolean): string {
  const line = ` ${conditionColor(piece.condition)} ${chalk.bold(piece.file)} ${pieceColor(piece.pieceType)} mob:${scoreColor(piece.mobility)} ctrl:${scoreColor(piece.boardControl)} tac:${scoreColor(piece.tacticalStrength)} strat:${scoreColor(piece.strategicDepth)} coord:${scoreColor(piece.coordination)} end:${scoreColor(piece.endgameStability)}`

  if (!verbose) return line

  const details = [line]
  details.push(`    position: rank:${piece.position.rank} file:${piece.position.file} developed:${piece.position.isDeveloped ? chalk.green('Y') : chalk.red('N')} active:${piece.position.isActive ? chalk.green('Y') : chalk.red('N')} pinned:${piece.position.isPinned ? chalk.yellow('Y') : chalk.green('N')} forked:${piece.position.isForked ? chalk.green('Y') : chalk.red('N')} enPrise:${piece.position.isEnPrise ? chalk.red('Y') : chalk.green('N')} squares:${piece.position.squaresControlled}`)
  details.push(`    mobility: moves:${piece.mobilityDetail.availableMoves} mobile:${piece.mobilityDetail.isMobile ? chalk.green('Y') : chalk.red('N')} blocked:${piece.mobilityDetail.isBlocked ? chalk.red('Y') : chalk.green('N')} escape:${piece.mobilityDetail.hasEscape ? chalk.green('Y') : chalk.red('N')} trapped:${piece.mobilityDetail.isTrapped ? chalk.red('Y') : chalk.green('N')} quality:${scoreColor(piece.mobilityDetail.moveQuality)}`)
  details.push(`    tactics: forks:${piece.tactics.hasForks ? chalk.green('Y') : chalk.red('N')} pins:${piece.tactics.hasPins ? chalk.green('Y') : chalk.red('N')} defended:${piece.tactics.isDefended ? chalk.green('Y') : chalk.red('N')} underAttack:${piece.tactics.isUnderAttack ? chalk.red('Y') : chalk.green('N')} atk:${scoreColor(piece.tactics.attackSurface)} def:${scoreColor(piece.tactics.defenseDepth)}`)
  details.push(`    strategy: central:${piece.strategy.isCentralized ? chalk.green('Y') : chalk.red('N')} plan:${piece.strategy.hasClearPlan ? chalk.green('Y') : chalk.red('N')} initiative:${piece.strategy.hasInitiative ? chalk.green('Y') : chalk.red('N')} value:${scoreColor(piece.strategy.strategicValue)}`)
  details.push(`    coordination: protected:${piece.coordinationDetail.protectedPieces} attacking:${piece.coordinationDetail.attackingPieces} coordinated:${piece.coordinationDetail.isCoordinated ? chalk.green('Y') : chalk.red('N')} tempo:${piece.coordinationDetail.hasTempo ? chalk.green('Y') : chalk.red('N')}`)
  details.push(`    endgame: promotable:${piece.endgame.isPromotable ? chalk.green('Y') : chalk.red('N')} passed:${piece.endgame.isPassed ? chalk.green('Y') : chalk.red('N')} isolated:${piece.endgame.isIsolated ? chalk.red('Y') : chalk.green('N')} structure:${scoreColor(piece.endgame.pawnStructure)} safety:${scoreColor(piece.endgame.kingSafety)}`)
  return details.join('\n')
}

// ─── Rank Formatting ─────────────────────────────────────────────────────────

function formatRank(rank: ChessRank): string {
  return `  ${chalk.bold(rank.directory)} ${rankTypeColor(rank.rankType)} ${rankConditionColor(rank.condition)} pieces:${rank.pieces.length} mob:${scoreColor(rank.avgMobility)} tac:${scoreColor(rank.avgTacticalStrength)} strat:${scoreColor(rank.avgStrategicDepth)} coord:${scoreColor(rank.avgCoordination)} GM:${rank.grandmasterCount} blunder:${rank.blunderCount}`
}

// ─── Table Formatter ─────────────────────────────────────────────────────────

/**
 * Format chess board result as a table
 * @example
 * formatChessBoardTable(result, false) // string
 */
export function formatChessBoardTable(result: ChessBoardResult, verbose: boolean): string {
  const lines: string[] = []
  lines.push(chalk.bold('\n♟  Chess Board - Code Strategic/Architectural Analysis\n'))
  lines.push(chalk.bold('═'.repeat(60)))
  lines.push('')

  lines.push(chalk.bold('♞ Pieces'))
  if (result.pieces.length === 0) {
    lines.push(chalk.dim('  No files analyzed.'))
  } else {
    const display = verbose ? result.pieces : result.pieces.slice(0, 15)
    for (const piece of display) {
      lines.push(formatPiece(piece, verbose))
    }
    if (!verbose && result.pieces.length > 15) {
      lines.push(chalk.dim(`  ... and ${result.pieces.length - 15} more`))
    }
  }
  lines.push('')

  if (result.ranks.length > 0) {
    lines.push(chalk.bold('♜ Ranks'))
    for (const rank of result.ranks) {
      lines.push(formatRank(rank))
    }
    lines.push('')
  }

  const g = result.game
  lines.push(chalk.bold('♛ Game'))
  lines.push(`  Mobility:${scoreColor(g.avgMobility)} Tactical:${scoreColor(g.avgTacticalStrength)} Strategic:${scoreColor(g.avgStrategicDepth)} Coord:${scoreColor(g.avgCoordination)} Endgame:${scoreColor(g.avgEndgameStability)} Winning:${g.isWinning ? chalk.green('YES') : chalk.red('NO')} Position:${scoreColor(g.overallPosition)}`)
  lines.push('')

  const s = result.stats
  lines.push(chalk.bold('📊 Statistics'))
  lines.push(`  Grade: ${gradeColor(s.playerGrade)} | Position: ${scoreColor(s.overallPosition)} | Files: ${s.totalFiles} | Ranks: ${s.totalRanks}`)
  lines.push(`  ♚:${s.kingCount} ♛:${s.queenCount} ♜:${s.rookCount} ♝:${s.bishopCount} ♞:${s.knightCount} ♟:${s.pawnCount}`)
  lines.push(`  GM:${s.grandmasterMoveCount} Strong:${s.strongPositionCount} Dev:${s.developedCount} Open:${s.openingCount} Blunder:${s.blunderCount} Mate:${s.checkmateCount}`)
  lines.push(`  Developed:${s.developedPieces} Active:${s.activePieces} Pinned:${s.pinnedPieces} Trapped:${s.trappedPieces} Defended:${s.defendedPieces} Attacked:${s.underAttackPieces}`)
  lines.push(`  Central:${s.centralizedPieces} Isolated:${s.isolatedPieces} Promotable:${s.promotablePieces} ClearPlan:${s.hasClearPlanCount}`)
  lines.push(`  Best:${chalk.green(s.bestPosition)} | Worst:${chalk.red(s.worstPosition)} | Powerful:${chalk.blue(s.mostPowerful)} | Strategic:${chalk.cyan(s.mostStrategic)} | Coordinated:${chalk.magenta(s.mostCoordinated)}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.bold('💡 Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  - ${rec}`)
    }
  }

  lines.push('')
  return lines.join('\n')
}

// ─── JSON Formatter ──────────────────────────────────────────────────────────

/**
 * Format chess board result as JSON
 * @example
 * formatChessBoardJson(result) // string
 */
export function formatChessBoardJson(result: ChessBoardResult): string {
  return JSON.stringify(result, null, 2)
}
