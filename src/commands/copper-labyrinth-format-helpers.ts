// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'

import type { CopperLabyrinthResult, CopperPath, CopperChamber } from './copper-labyrinth-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────

const COPPER = chalk.rgb(200, 120, 50)
const VERDIGRIS = chalk.rgb(80, 180, 140)
const GOLD = chalk.rgb(255, 200, 50)
const DIM = chalk.rgb(140, 145, 160)
const BULLET = '\u{1F6AA}'

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * @example colorScore(85)
 */
export function colorScore(score: number): string {
  if (score >= 80) return COPPER.bold(String(score))
  if (score >= 60) return VERDIGRIS(String(score))
  if (score >= 40) return GOLD(String(score))
  if (score >= 20) return DIM(String(score))
  return chalk.gray(String(score))
}

/**
 * @example colorGrade('golden-labyrinth')
 */
export function colorGrade(grade: string): string {
  if (grade.includes('golden') || grade.includes('grand-labyrinth') || grade.includes('magnificent') || grade.includes('master-architect') || grade.includes('clear-corridor') || grade.includes('noble-verdigris') || grade.includes('perfect-spiral') || grade.includes('copper-bastion') || grade.includes('minotaur-sage')) return COPPER.bold(grade)
  if (grade.includes('copper') || grade.includes('proper') || grade.includes('marked') || grade.includes('aged') || grade.includes('logical') || grade.includes('strong') || grade.includes('labyrinth-keeper') || grade.includes('labyrinth-designer') || grade.includes('skilled-builder')) return VERDIGRIS(grade)
  if (grade.includes('tangled') || grade.includes('dark') || grade.includes('tarnished') || grade.includes('random') || grade.includes('thin') || grade.includes('lost') || grade.includes('small') || grade.includes('apprentice')) return GOLD(grade)
  return DIM(grade)
}

// ─── Path Table ────────────────────────────────────────────────────

/**
 * @example formatPathTable(path)
 */
export function formatPathTable(copperPath: CopperPath): string {
  const lines: string[] = []
  lines.push(COPPER.bold(`${BULLET} ${copperPath.file}`))
  lines.push(`  Path Clarity      : ${colorScore(copperPath.pathClarity)}  ${colorGrade(copperPath.navigating.path)}`)
  lines.push(`  Copper Patience   : ${colorScore(copperPath.copperPatience)}  ${colorGrade(copperPath.aging.patina)}`)
  lines.push(`  Twist Coherence   : ${colorScore(copperPath.twistCoherence)}  ${colorGrade(copperPath.twisting.logic)}`)
  lines.push(`  Wall Resilience   : ${colorScore(copperPath.wallResilience)}  ${colorGrade(copperPath.shielding.wall)}`)
  lines.push(`  Center Wisdom     : ${colorScore(copperPath.centerWisdom)}  ${colorGrade(copperPath.knowing.center)}`)
  lines.push(`  Quality Score     : ${colorScore(copperPath.qualityScore)}  ${colorGrade(copperPath.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatPathsTable(paths)
 */
export function formatPathsTable(paths: CopperPath[]): string {
  if (paths.length === 0) return chalk.gray('No copper paths to display')
  return paths.map(formatPathTable).join('\n\n')
}

// ─── Chamber Table ─────────────────────────────────────────────────

/**
 * @example formatChamberTable(chamber)
 */
export function formatChamberTable(chamber: CopperChamber): string {
  const lines: string[] = []
  lines.push(COPPER.bold(`${BULLET} ${chamber.directory}`))
  lines.push(`  Paths              : ${chamber.paths.length}`)
  lines.push(`  Avg Clarity        : ${colorScore(chamber.avgClarity)}`)
  lines.push(`  Avg Coherence      : ${colorScore(chamber.avgCoherence)}`)
  lines.push(`  Avg Wisdom         : ${colorScore(chamber.avgWisdom)}`)
  lines.push(`  Golden Labyrinths  : ${chamber.goldenLabyrinthCount}`)
  lines.push(`  Collapsed          : ${chamber.collapseCount}`)
  lines.push(`  Chamber Type       : ${colorGrade(chamber.chamberType)}`)
  lines.push(`  Condition          : ${colorGrade(chamber.condition)}`)
  return lines.join('\n')
}

/**
 * @example formatChambersTable(chambers)
 */
export function formatChambersTable(chambers: CopperChamber[]): string {
  if (chambers.length === 0) return chalk.gray('No copper chambers to display')
  return chambers.map(formatChamberTable).join('\n\n')
}

// ─── Stats Table ───────────────────────────────────────────────────

/**
 * @example formatStatsTable(stats)
 */
export function formatStatsTable(stats: CopperLabyrinthResult['stats']): string {
  const lines: string[] = []
  lines.push(COPPER.bold('Copper Labyrinth Statistics'))
  lines.push(`  Total Files        : ${stats.totalFiles}`)
  lines.push(`  Total Chambers     : ${stats.totalChambers}`)
  lines.push(`  Avg Path Clarity   : ${colorScore(stats.avgPathClarity)}`)
  lines.push(`  Avg Copper Patience: ${colorScore(stats.avgCopperPatience)}`)
  lines.push(`  Avg Twist Coherence: ${colorScore(stats.avgTwistCoherence)}`)
  lines.push(`  Avg Wall Resilience: ${colorScore(stats.avgWallResilience)}`)
  lines.push(`  Avg Center Wisdom  : ${colorScore(stats.avgCenterWisdom)}`)
  lines.push(`  Golden Labyrinth   : ${stats.goldenLabyrinthCount}`)
  lines.push(`  Copper Maze        : ${stats.copperMazeCount}`)
  lines.push(`  Proper Passage     : ${stats.properPassageCount}`)
  lines.push(`  Tangled Wires      : ${stats.tangledWiresCount}`)
  lines.push(`  Dark Corridor      : ${stats.darkCorridorCount}`)
  lines.push(`  Collapse           : ${stats.collapseCount}`)
  lines.push(`  Overall Navigability: ${colorScore(stats.overallNavigability)}`)
  lines.push(`  Architect Grade    : ${colorGrade(stats.architectGrade)}`)
  lines.push(`  Best Path          : ${VERDIGRIS(stats.bestPath)}`)
  lines.push(`  Clearest           : ${VERDIGRIS(stats.clearest)}`)
  lines.push(`  Most Patient       : ${VERDIGRIS(stats.mostPatient)}`)
  lines.push(`  Most Coherent      : ${VERDIGRIS(stats.mostCoherent)}`)
  lines.push(`  Wisest             : ${VERDIGRIS(stats.wisest)}`)
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────

/**
 * @example formatRecommendations(['improve X'])
 */
export function formatRecommendations(recs: string[]): string {
  if (recs.length === 0) return chalk.gray('No recommendations')
  return recs.map(r => `${BULLET} ${VERDIGRIS(r)}`).join('\n')
}

// ─── Full Result ───────────────────────────────────────────────────

/**
 * @example formatResultTable(result)
 */
export function formatResultTable(result: CopperLabyrinthResult): string {
  const sections: string[] = []

  sections.push(COPPER.bold('Copper Path Analysis'))
  sections.push(formatPathsTable(result.paths))
  sections.push('')
  sections.push(COPPER.bold('Copper Chambers'))
  sections.push(formatChambersTable(result.chambers))
  sections.push('')
  sections.push(formatStatsTable(result.stats))
  sections.push('')
  sections.push(COPPER.bold('Maze'))
  sections.push(`  Avg Clarity          : ${colorScore(result.maze.avgClarity)}`)
  sections.push(`  Avg Coherence        : ${colorScore(result.maze.avgCoherence)}`)
  sections.push(`  Avg Wisdom           : ${colorScore(result.maze.avgWisdom)}`)
  sections.push(`  Is Golden            : ${result.maze.isGolden ? COPPER.bold('YES') : chalk.gray('NO')}`)
  sections.push(`  Overall Navigability : ${colorScore(result.maze.overallNavigability)}`)
  sections.push('')
  sections.push(COPPER.bold('Recommendations'))
  sections.push(formatRecommendations(result.recommendations))

  return sections.join('\n')
}

/**
 * @example formatResultJson(result)
 */
export function formatResultJson(result: CopperLabyrinthResult): string {
  return JSON.stringify(result, null, 2)
}
