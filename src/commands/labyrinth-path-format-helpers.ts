import chalk from 'chalk'

import type { LabyrinthPathResult } from './labyrinth-path-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('garden-maze') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'garden-maze': return chalk.rgb(46, 204, 113).bold(condition)
    case 'navigable-labyrinth': return chalk.rgb(52, 152, 219)(condition)
    case 'challenging-puzzle': return chalk.rgb(155, 89, 182)(condition)
    case 'confusing-maze': return chalk.rgb(241, 196, 15)(condition)
    case 'minotaur-lair': return chalk.rgb(230, 126, 34)(condition)
    case 'inescapable-trap': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('daedalus') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'daedalus': return chalk.rgb(46, 204, 113).bold(grade)
    case 'master-architect': return chalk.rgb(52, 152, 219)(grade)
    case 'labyrinth-designer': return chalk.rgb(155, 89, 182)(grade)
    case 'maze-builder': return chalk.rgb(241, 196, 15)(grade)
    case 'novice': return chalk.rgb(230, 126, 34)(grade)
    case 'theseus': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example pathTypeColor('straight-corridor') returns colored string */
export function pathTypeColor(type: string): string {
  switch (type) {
    case 'straight-corridor': return chalk.rgb(46, 204, 113)(type)
    case 'gentle-curve': return chalk.rgb(52, 152, 219)(type)
    case 'right-angle': return chalk.rgb(155, 89, 182)(type)
    case 'spiral': return chalk.rgb(241, 196, 15)(type)
    case 'zigzag': return chalk.rgb(230, 126, 34)(type)
    case 'tangle': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

/** @example mazeDesignColor('classical') returns colored string */
export function mazeDesignColor(design: string): string {
  switch (design) {
    case 'classical': return chalk.rgb(46, 204, 113)(design)
    case 'medieval': return chalk.rgb(52, 152, 219)(design)
    case 'hedge': return chalk.rgb(155, 89, 182)(design)
    case 'crystal': return chalk.rgb(241, 196, 15)(design)
    case 'mirror': return chalk.rgb(230, 126, 34)(design)
    case 'chaos': return chalk.rgb(231, 76, 60)(design)
    default: return design
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatLabyrinthPathJson(result) returns JSON string */
export function formatLabyrinthPathJson(result: LabyrinthPathResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatLabyrinthPathTable(result, false) returns formatted string */
export function formatLabyrinthPathTable(result: LabyrinthPathResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push(chalk.rgb(155, 89, 182).bold('Labyrinth Path Analysis'))
  lines.push('')
  lines.push(`Overall Navigability: ${scoreColor(result.labyrinth.overallNavigability)}/100`)
  lines.push(`Architect Grade: ${gradeColor(result.stats.architectGrade)}`)
  lines.push(`Files: ${result.stats.totalFiles} | Wings: ${result.stats.totalWings}`)
  lines.push('')

  lines.push(chalk.rgb(155, 89, 182).bold('Averages'))
  lines.push(`  Path Clarity:      ${scoreColor(result.stats.avgPathClarity)}`)
  lines.push(`  Maze Complexity:   ${scoreColor(result.stats.avgMazeComplexity)}`)
  lines.push(`  Dead-End Detection: ${scoreColor(result.stats.avgDeadEndDetection)}`)
  lines.push(`  Thread Guidance:   ${scoreColor(result.stats.avgThreadGuidance)}`)
  lines.push(`  Minotaur Danger:   ${scoreColor(result.stats.avgMinotaurDanger)}`)
  lines.push(`  Exit Strategy:     ${scoreColor(result.stats.avgExitStrategy)}`)

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('Condition Distribution'))
  lines.push(`  Garden Maze:          ${result.stats.gardenMazeCount}`)
  lines.push(`  Navigable Labyrinth:  ${result.stats.navigableLabyrinthCount}`)
  lines.push(`  Challenging Puzzle:   ${result.stats.challengingPuzzleCount}`)
  lines.push(`  Confusing Maze:       ${result.stats.confusingMazeCount}`)
  lines.push(`  Minotaur Lair:        ${result.stats.minotaurLairCount}`)
  lines.push(`  Inescapable Trap:     ${result.stats.inescapableTrapCount}`)

  if (result.recommendations.length > 0) {
    lines.push('')
    lines.push(chalk.rgb(155, 89, 182).bold('Recommendations'))
    for (const rec of result.recommendations) {
      lines.push(`  ${chalk.rgb(241, 196, 15)('→')} ${rec}`)
    }
  }

  if (verbose && result.cells.length > 0) {
    lines.push('')
    lines.push(chalk.rgb(155, 89, 182).bold('Per-Cell Breakdown'))
    for (const cell of result.cells) {
      lines.push(`  ${chalk.rgb(241, 196, 15)(cell.file)} [${conditionColor(cell.condition)}] ${scoreColor(cell.qualityScore)}`)
      lines.push(`    Path: ${scoreColor(cell.path.clarity)} (${pathTypeColor(cell.path.type)})`)
      lines.push(`    Maze: ${scoreColor(cell.maze.complexity)} (${mazeDesignColor(cell.maze.design)})`)
      lines.push(`    DeadEnd: ${scoreColor(cell.deadEnd.detection)} (${cell.deadEnd.type})`)
      lines.push(`    Thread: ${scoreColor(cell.thread.guidance)} (${cell.thread.type})`)
      lines.push(`    Minotaur: ${scoreColor(cell.minotaur.danger)} (${cell.minotaur.type})`)
      lines.push(`    Exit: ${scoreColor(cell.exit.strategy)} (${cell.exit.type})`)
    }
  }

  return lines.join('\n')
}
