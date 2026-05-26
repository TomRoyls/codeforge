import chalk from 'chalk'

import type { MazeCondition, MazeType, NavigatorGrade, SilverCondition, SilverCorridor, SilverLabyrinthResult, SilverMaze } from './silver-labyrinth-helpers.js'

// ─── Color helpers ──────────────────────────────────────

/** @example colorScore(85) */
export function colorScore(score: number): string {
  if (score >= 90) return chalk.rgb(200, 200, 220)(String(score))
  if (score >= 75) return chalk.rgb(180, 180, 200)(String(score))
  if (score >= 60) return chalk.rgb(160, 160, 185)(String(score))
  if (score >= 40) return chalk.rgb(140, 140, 170)(String(score))
  if (score >= 20) return chalk.rgb(120, 120, 150)(String(score))
  return chalk.gray(String(score))
}

/** @example colorSilverCondition('silver-masterpiece') */
export function colorSilverCondition(condition: SilverCondition | string): string {
  switch (condition) {
    case 'silver-masterpiece': return chalk.rgb(200, 200, 220)('silver-masterpiece')
    case 'mirror-labyrinth': return chalk.rgb(180, 180, 200)('mirror-labyrinth')
    case 'proper-silver': return chalk.rgb(160, 160, 185)('proper-silver')
    case 'tarnished-metal': return chalk.rgb(140, 140, 170)('tarnished-metal')
    case 'rusty-iron': return chalk.rgb(120, 120, 150)('rusty-iron')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorMazeType('grand-labyrinth') */
export function colorMazeType(type: MazeType | string): string {
  switch (type) {
    case 'grand-labyrinth': return chalk.rgb(200, 200, 220)('grand-labyrinth')
    case 'silver-palace': return chalk.rgb(180, 180, 200)('silver-palace')
    case 'proper-maze': return chalk.rgb(160, 160, 185)('proper-maze')
    case 'simple-path': return chalk.rgb(140, 140, 170)('simple-path')
    case 'dead-end': return chalk.rgb(120, 120, 150)('dead-end')
    case 'no-maze': return chalk.gray('no-maze')
    default: return chalk.gray(String(type))
  }
}

/** @example colorMazeCondition('mirror-palace') */
export function colorMazeCondition(condition: MazeCondition | string): string {
  switch (condition) {
    case 'mirror-palace': return chalk.rgb(200, 200, 220)('mirror-palace')
    case 'silver-hall': return chalk.rgb(180, 180, 200)('silver-hall')
    case 'proper-corridor': return chalk.rgb(160, 160, 185)('proper-corridor')
    case 'stone-passage': return chalk.rgb(140, 140, 170)('stone-passage')
    case 'dirt-tunnel': return chalk.rgb(120, 120, 150)('dirt-tunnel')
    case 'void': return chalk.gray('void')
    default: return chalk.gray(String(condition))
  }
}

/** @example colorNavigatorGrade('labyrinth-master') */
export function colorNavigatorGrade(grade: NavigatorGrade | string): string {
  switch (grade) {
    case 'labyrinth-master': return chalk.rgb(200, 200, 220)('labyrinth-master')
    case 'silver-guide': return chalk.rgb(180, 180, 200)('silver-guide')
    case 'proper-navigator': return chalk.rgb(160, 160, 185)('proper-navigator')
    case 'lost-traveler': return chalk.rgb(140, 140, 170)('lost-traveler')
    case 'novice': return chalk.rgb(120, 120, 150)('novice')
    case 'wanderer': return chalk.gray('wanderer')
    default: return chalk.gray(String(grade))
  }
}

// ─── Table formatting ───────────────────────────────────

/** @example formatCorridorTable(corridor) */
export function formatCorridorTable(corridor: SilverCorridor): string {
  const lines: string[] = [
    chalk.bold(`Silver Corridor: ${corridor.file}`),
    '',
    `  Reflective Purity:  ${colorScore(corridor.reflectivePurity)}  ${chalk.dim(`(${corridor.mirroring.reflection})`)}`,
    `  Path Clarity:       ${colorScore(corridor.pathClarity)}  ${chalk.dim(`(${corridor.guiding.path})`)}`,
    `  Maze Precision:     ${colorScore(corridor.mazePrecision)}  ${chalk.dim(`(${corridor.constructing.craft})`)}`,
    `  Wall Resilience:    ${colorScore(corridor.wallResilience)}  ${chalk.dim(`(${corridor.defending.fortification})`)}`,
    `  Center Wisdom:      ${colorScore(corridor.centerWisdom)}  ${chalk.dim(`(${corridor.understanding.center})`)}`,
    '',
    `  Quality Score: ${colorScore(corridor.qualityScore)}  ${chalk.dim(`(${corridor.condition})`)}`,
  ]
  return lines.join('\n')
}

/** @example formatCorridorsTable(corridors) */
export function formatCorridorsTable(corridors: SilverCorridor[]): string {
  if (corridors.length === 0) return chalk.dim('No silver corridors found')
  const lines: string[] = [chalk.bold('Silver Corridors'), '']
  for (const c of corridors) {
    lines.push(`  ${chalk.rgb(200, 200, 220)(c.file)}  Pur:${colorScore(c.reflectivePurity)}  Cla:${colorScore(c.pathClarity)}  Score:${colorScore(c.qualityScore)}`)
  }
  return lines.join('\n')
}

/** @example formatMazeTable(maze) */
export function formatMazeTable(maze: SilverMaze): string {
  const lines: string[] = [
    chalk.bold(`Silver Maze: ${maze.directory}`),
    '',
    `  Corridors:         ${maze.corridors.length}`,
    `  Avg Purity:        ${colorScore(maze.avgPurity)}`,
    `  Avg Precision:     ${colorScore(maze.avgPrecision)}`,
    `  Avg Wisdom:        ${colorScore(maze.avgWisdom)}`,
    `  Masterpieces:      ${maze.silverMasterpieceCount}`,
    `  Type:              ${colorMazeType(maze.mazeType)}`,
    `  Condition:         ${colorMazeCondition(maze.condition)}`,
  ]
  return lines.join('\n')
}

/** @example formatMazesTable(mazes) */
export function formatMazesTable(mazes: SilverMaze[]): string {
  if (mazes.length === 0) return chalk.dim('No silver mazes found')
  const lines: string[] = [chalk.bold('Silver Mazes'), '']
  for (const m of mazes) {
    lines.push(`  ${chalk.rgb(200, 200, 220)(m.directory)}  ${colorScore(m.avgPurity)}  ${colorMazeCondition(m.condition)}`)
  }
  return lines.join('\n')
}

/** @example formatStatsTable(stats) */
export function formatStatsTable(stats: SilverLabyrinthResult['stats']): string {
  const lines: string[] = [
    chalk.bold('Silver Labyrinth Statistics'),
    '',
    `  Total Files:              ${stats.totalFiles}`,
    `  Total Mazes:              ${stats.totalMazes}`,
    `  Avg Reflective Purity:    ${colorScore(stats.avgReflectivePurity)}`,
    `  Avg Path Clarity:         ${colorScore(stats.avgPathClarity)}`,
    `  Avg Maze Precision:       ${colorScore(stats.avgMazePrecision)}`,
    `  Avg Wall Resilience:      ${colorScore(stats.avgWallResilience)}`,
    `  Avg Center Wisdom:        ${colorScore(stats.avgCenterWisdom)}`,
    `  Silver Masterpieces:      ${stats.silverMasterpieceCount}`,
    `  Mirror Labyrinths:        ${stats.mirrorLabyrinthCount}`,
    `  Proper Silver:            ${stats.properSilverCount}`,
    `  Tarnished Metal:          ${stats.tarnishedMetalCount}`,
    `  Rusty Iron:               ${stats.rustyIronCount}`,
    `  Void:                     ${stats.voidCount}`,
    `  Overall Reflection:       ${colorScore(stats.overallReflection)}`,
    `  Navigator Grade:          ${colorNavigatorGrade(stats.navigatorGrade)}`,
    `  Best Corridor:            ${stats.bestCorridor || 'N/A'}`,
    `  Purest:                   ${stats.purest || 'N/A'}`,
    `  Clearest:                 ${stats.clearest || 'N/A'}`,
    `  Most Precise:             ${stats.mostPrecise || 'N/A'}`,
    `  Most Resilient:           ${stats.mostResilient || 'N/A'}`,
    `  Wisest:                   ${stats.wisest || 'N/A'}`,
  ]
  return lines.join('\n')
}

/** @example formatRecommendations(['Fix X']) */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.dim('No recommendations')
  const lines: string[] = [chalk.bold('Recommendations'), '']
  for (const rec of recommendations) {
    lines.push(`  ${chalk.rgb(200, 200, 220)('\u2022')} ${rec}`)
  }
  return lines.join('\n')
}

/** @example formatResultTable(result) */
export function formatResultTable(result: SilverLabyrinthResult): string {
  const lines: string[] = [
    chalk.bold('Silver Labyrinth Analysis'),
    '',
    formatCorridorsTable(result.corridors),
    '',
    formatMazesTable(result.mazes),
    '',
    chalk.bold('Labyrinth Overview'),
    '',
    `  Avg Purity:          ${colorScore(result.labyrinth.avgPurity)}`,
    `  Avg Precision:       ${colorScore(result.labyrinth.avgPrecision)}`,
    `  Avg Wisdom:          ${colorScore(result.labyrinth.avgWisdom)}`,
    `  Overall Reflection:  ${colorScore(result.labyrinth.overallReflection)}`,
    `  Is Silver:           ${result.labyrinth.isSilver ? chalk.rgb(200, 200, 220)('yes') : chalk.gray('no')}`,
    '',
    formatStatsTable(result.stats),
    '',
    formatRecommendations(result.recommendations),
  ]
  return lines.join('\n')
}

/** @example formatResultJson(result) */
export function formatResultJson(result: SilverLabyrinthResult): string {
  return JSON.stringify(result, null, 2)
}
