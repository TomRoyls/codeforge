import chalk from 'chalk'

import type { CopperLabyrinthResult, CopperMaze, CopperPath, MazeCondition } from './copper-maze-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(205, 127, 50)(String(score))
  if (score >= 75) return chalk.rgb(184, 115, 51)(String(score))
  if (score >= 60) return chalk.rgb(150, 100, 45)(String(score))
  if (score >= 40) return chalk.rgb(120, 80, 40)(String(score))
  if (score >= 20) return chalk.rgb(90, 60, 35)(String(score))
  return chalk.gray(String(score))
}

/** @example colorMazeCondition('copper-palace') */
export function colorMazeCondition(condition: MazeCondition | string): string {
  switch (condition) {
    case 'copper-palace': return chalk.rgb(205, 127, 50)('copper-palace')
    case 'aged-sanctuary': return chalk.rgb(184, 115, 51)('aged-sanctuary')
    case 'proper-hall': return chalk.rgb(150, 100, 45)('proper-hall')
    case 'crumbling-corridor': return chalk.rgb(120, 80, 40)('crumbling-corridor')
    case 'rubble': return chalk.rgb(90, 60, 35)('rubble')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

// ─── Table formatting ───────────────────────────────────

function padRight(str: string, len: number): string {
  if (str.length >= len) return str
  return str + ' '.repeat(len - str.length)
}

function padLeft(str: string, len: number): string {
  if (str.length >= len) return str
  return ' '.repeat(len - str.length) + str
}

/** @example formatPathTable(path) */
export function formatPathTable(path: CopperPath): string {
  const lines: string[] = [
    chalk.bold(`Copper Path: ${path.file}`),
    '',
    `  Path Clarity:     ${colorScore(path.pathClarity)}  ${chalk.dim(`(${path.guiding.path})`)}`,
    `  Copper Patience:  ${colorScore(path.copperPatience)}  ${chalk.dim(`(${path.aging.patina})`)}`,
    `  Twist Coherence:  ${colorScore(path.twistCoherence)}  ${chalk.dim(`(${path.weaving.twist})`)}`,
    `  Wall Resilience:  ${colorScore(path.wallResilience)}  ${chalk.dim(`(${path.bounding.wall})`)}`,
    `  Center Wisdom:    ${colorScore(path.centerWisdom)}  ${chalk.dim(`(${path.deepening.center})`)}`,
    '',
    `  Quality Score: ${colorScore(path.qualityScore)}  ${chalk.dim(`(${path.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatPathsTable(paths) */
export function formatPathsTable(paths: CopperPath[]): string {
  if (paths.length === 0) return chalk.dim('No copper paths found')
  const colWidths = {
    file: Math.max(4, ...paths.map((p) => p.file.length)),
    clarity: Math.max(7, ...paths.map((p) => String(p.pathClarity).length)),
    patience: Math.max(9, ...paths.map((p) => String(p.copperPatience).length)),
    coherence: Math.max(9, ...paths.map((p) => String(p.twistCoherence).length)),
    resilience: Math.max(10, ...paths.map((p) => String(p.wallResilience).length)),
    wisdom: Math.max(6, ...paths.map((p) => String(p.centerWisdom).length)),
    score: Math.max(5, ...paths.map((p) => String(p.qualityScore).length)),
  }
  const lines: string[] = [chalk.bold('Copper Paths'), '']
  const header =
    chalk.rgb(205, 127, 50)(padRight('File', colWidths.file)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Clarity', colWidths.clarity)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Patience', colWidths.patience)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Coherence', colWidths.coherence)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Resilience', colWidths.resilience)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Wisdom', colWidths.wisdom)) + '  ' +
    chalk.rgb(205, 127, 50)(padLeft('Score', colWidths.score))
  lines.push(header)
  lines.push(chalk.dim('─'.repeat(header.length)))
  for (const p of paths) {
    lines.push(
      padRight(p.file, colWidths.file) + '  ' +
      padLeft(String(p.pathClarity), colWidths.clarity) + '  ' +
      padLeft(String(p.copperPatience), colWidths.patience) + '  ' +
      padLeft(String(p.twistCoherence), colWidths.coherence) + '  ' +
      padLeft(String(p.wallResilience), colWidths.resilience) + '  ' +
      padLeft(String(p.centerWisdom), colWidths.wisdom) + '  ' +
      padLeft(String(p.qualityScore), colWidths.score))
  }
  return lines.join('\n')
}

/** @example formatMazeTable(maze) */
export function formatMazeTable(maze: CopperMaze): string {
  const lines: string[] = [
    chalk.bold(`Copper Maze: ${maze.directory}`),
    '',
    `  Paths:            ${maze.paths.length}`,
    `  Avg Clarity:      ${colorScore(maze.avgClarity)}`,
    `  Avg Coherence:    ${colorScore(maze.avgCoherence)}`,
    `  Avg Wisdom:       ${colorScore(maze.avgWisdom)}`,
    `  Masterpieces:     ${maze.labyrinthMasterpieceCount}`,
    `  Maze Type:        ${maze.mazeType}`,
    `  Condition:        ${colorMazeCondition(maze.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatMazesTable(mazes) */
export function formatMazesTable(mazes: CopperMaze[]): string {
  if (mazes.length === 0) return chalk.dim('No copper mazes found')
  const lines: string[] = [chalk.bold('Copper Mazes'), '']
  for (const m of mazes) {
    lines.push(`  ${chalk.rgb(205, 127, 50)(m.directory)}  ${colorScore(m.avgClarity)}  ${colorMazeCondition(m.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: CopperLabyrinthResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Copper Labyrinth Statistics'),
    '',
    `  Total Files:               ${stats.totalFiles}`,
    `  Total Mazes:               ${stats.totalMazes}`,
    `  Avg Path Clarity:          ${colorScore(stats.avgPathClarity)}`,
    `  Avg Copper Patience:       ${colorScore(stats.avgCopperPatience)}`,
    `  Avg Twist Coherence:       ${colorScore(stats.avgTwistCoherence)}`,
    `  Avg Wall Resilience:       ${colorScore(stats.avgWallResilience)}`,
    `  Avg Center Wisdom:         ${colorScore(stats.avgCenterWisdom)}`,
    `  Labyrinth Masterpieces:    ${stats.labyrinthMasterpieceCount}`,
    `  Ancient Mazes:             ${stats.ancientMazeCount}`,
    `  Proper Paths:              ${stats.properPathCount}`,
    `  Crumbling Walls:           ${stats.crumblingWallCount}`,
    `  Collapsed Tunnels:         ${stats.collapsedTunnelCount}`,
    `  Void:                      ${stats.voidCount}`,
    `  Overall Navigation:        ${colorScore(stats.overallNavigation)}`,
    `  Navigator Grade:           ${stats.navigatorGrade}`,
    `  Best Path:                 ${stats.bestPath || 'N/A'}`,
    `  Clearest:                  ${stats.clearest || 'N/A'}`,
    `  Most Patient:              ${stats.mostPatient || 'N/A'}`,
    `  Most Coherent:             ${stats.mostCoherent || 'N/A'}`,
    `  Most Resilient:            ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                    ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(205, 127, 50)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: CopperLabyrinthResult): string {
  const lines: string[] = [
    chalk.bold('Copper Labyrinth Analysis'),
    '',
    formatPathsTable(result.paths),
    '',
    formatMazesTable(result.mazes),
    '',
    chalk.bold('Labyrinth Overview'),
    '',
    `  Avg Clarity:      ${colorScore(result.labyrinth.avgClarity)}`,
    `  Avg Coherence:    ${colorScore(result.labyrinth.avgCoherence)}`,
    `  Avg Wisdom:       ${colorScore(result.labyrinth.avgWisdom)}`,
    `  Navigation:       ${colorScore(result.labyrinth.overallNavigation)}`,
    `  Is Copper:        ${result.labyrinth.isCopper ? chalk.rgb(205, 127, 50)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: CopperLabyrinthResult): string {
  return JSON.stringify(result, null, 2)
}
