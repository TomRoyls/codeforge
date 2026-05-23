// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { LabyrinthPath, LabyrinthLevel, LabyrinthThreadResult } from './labyrinth-thread-helpers.js'

// ─── Color Palette ─────────────────────────────────────────────────
const high = chalk.rgb(200, 160, 100)
const midHigh = chalk.rgb(175, 140, 85)
const mid = chalk.rgb(150, 120, 70)
const lowMid = chalk.rgb(125, 100, 60)
const low = chalk.rgb(100, 80, 50)

const best = chalk.rgb(230, 190, 120).bold
const good = chalk.rgb(205, 170, 105)
const okay = chalk.rgb(180, 150, 90)
const poor = chalk.rgb(155, 130, 75)
const worst = chalk.rgb(130, 110, 65)

const heading = chalk.rgb(220, 180, 110).bold
const label = chalk.rgb(190, 155, 95)
const dim = chalk.rgb(150, 165, 175)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // labyrinth gold
 */
export function colorScore(score: number): string {
  if (score >= 80) return high(String(score))
  if (score >= 60) return midHigh(String(score))
  if (score >= 40) return mid(String(score))
  if (score >= 20) return lowMid(String(score))
  return low(String(score))
}

/**
 * Color a grade/tier string by quality
 * @example
 * colorGrade('theseus-victory') // best (bold gold)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, string> = {
    'open-garden': best, 'golden-thread': best, 'invincible': best, 'unbreakable': best, 'grand-gate': best,
    'theseus-victory': best, 'grand-labyrinth': best, 'well-charted': best, 'ariadne': best,

    'clear-maze': good, 'well-marked': good, 'well-armed': good, 'strong-cord': good, 'clear-exit': good,
    'clever-navigator': good, 'proper-maze': good, 'navigable': good, 'master-navigator': good,

    'proper-labyrinth': okay, 'proper-path': okay, 'proper-shield': okay, 'proper-thread': okay, 'proper-door': okay,
    'proper-explorer': okay, 'garden-maze': okay, 'explorable': okay, 'skilled-explorer': okay,

    'confusing-maze': poor, 'faint-trail': poor, 'vulnerable': poor, 'fraying-cord': poor, 'hidden-exit': poor,
    'lost-wanderer': poor, 'hedge-maze': poor, 'confusing': poor, 'apprentice': poor,

    'impossible-labyrinth': worst, 'overgrown': worst, 'defenseless': worst, 'thin-thread': worst, 'locked-door': worst,
    'trapped-soul': worst, 'straw-maze': worst, 'treacherous': worst, 'lost-soul': worst,

    'no-exit': worst, 'invisible': worst, 'devoured': worst, 'snapped': worst, 'no-maze': worst,
    'minotaur-victim': worst, 'death-trap': worst, 'minotaur-food': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Path Formatting ──────────────────────────────────────────────

/**
 * Format a single path for display
 * @example
 * formatPathTable(path) // colored path info
 */
export function formatPathTable(lpath: LabyrinthPath): string {
  const parts = [
    `${label('File:')} ${dim(lpath.file)}`,
    `${label('Maze Solvability:')} ${colorScore(lpath.mazeSolvability)} ${colorGrade(lpath.navigating.grade)}`,
    `${label('Path Clarity:')} ${colorScore(lpath.pathClarity)} ${colorGrade(lpath.clarifying.path)}`,
    `${label('Minotaur Resistance:')} ${colorScore(lpath.minotaurResistance)} ${colorGrade(lpath.resisting.defense)}`,
    `${label('Thread Strength:')} ${colorScore(lpath.threadStrength)} ${colorGrade(lpath.threading.thread)}`,
    `${label('Exit Accessibility:')} ${colorScore(lpath.exitAccessibility)} ${colorGrade(lpath.exiting.exit)}`,
    `${label('Score:')} ${colorScore(lpath.qualityScore)} ${colorGrade(lpath.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format paths as summary table
 * @example
 * formatPathsTable(paths) // multi-line table
 */
export function formatPathsTable(paths: LabyrinthPath[]): string {
  if (paths.length === 0) return dim('No labyrinth paths found')
  const header = heading('Labyrinth Thread Analysis')
  const rows = paths.map(p => formatPathTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Level Formatting ──────────────────────────────────────────────

/**
 * Format a level for display
 * @example
 * formatLevelTable(level) // colored level info
 */
export function formatLevelTable(level: LabyrinthLevel): string {
  const parts = [
    `${label('Level:')} ${dim(level.directory)}`,
    `${label('Type:')} ${colorGrade(level.levelType)}`,
    `${label('Condition:')} ${colorGrade(level.condition)}`,
    `${label('Paths:')} ${String(level.paths.length)}`,
    `${label('Avg Solvability:')} ${colorScore(level.avgSolvability)}`,
    `${label('Avg Clarity:')} ${colorScore(level.avgClarity)}`,
    `${label('Avg Resistance:')} ${colorScore(level.avgResistance)}`,
    `${label('Theseus Victory:')} ${String(level.theseusVictoryCount)}`,
    `${label('Minotaur Victim:')} ${String(level.minotaurVictimCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all levels as summary
 * @example
 * formatLevelsTable(levels) // multi-line level summary
 */
export function formatLevelsTable(levels: LabyrinthLevel[]): string {
  if (levels.length === 0) return dim('No labyrinth levels found')
  const header = heading('Labyrinth Level Analysis')
  const rows = levels.map(l => formatLevelTable(l))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ──────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: LabyrinthThreadResult['stats']): string {
  const parts = [
    heading('Maze Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Levels:')} ${String(stats.totalLevels)}`,
    `${label('Avg Maze Solvability:')} ${colorScore(stats.avgMazeSolvability)}`,
    `${label('Avg Path Clarity:')} ${colorScore(stats.avgPathClarity)}`,
    `${label('Avg Minotaur Resistance:')} ${colorScore(stats.avgMinotaurResistance)}`,
    `${label('Avg Thread Strength:')} ${colorScore(stats.avgThreadStrength)}`,
    `${label('Avg Exit Accessibility:')} ${colorScore(stats.avgExitAccessibility)}`,
    `${label('Theseus Victory:')} ${String(stats.theseusVictoryCount)}`,
    `${label('Clever Navigator:')} ${String(stats.cleverNavigatorCount)}`,
    `${label('Proper Explorer:')} ${String(stats.properExplorerCount)}`,
    `${label('Lost Wanderer:')} ${String(stats.lostWandererCount)}`,
    `${label('Trapped Soul:')} ${String(stats.trappedSoulCount)}`,
    `${label('Minotaur Victim:')} ${String(stats.minotaurVictimCount)}`,
    `${label('High Solvability:')} ${String(stats.hasHighSolvabilityCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Resistance:')} ${String(stats.hasHighResistanceCount)}`,
    `${label('High Strength:')} ${String(stats.hasHighStrengthCount)}`,
    `${label('High Accessibility:')} ${String(stats.hasHighAccessibilityCount)}`,
    `${label('Overall Navigability:')} ${colorScore(stats.overallNavigability)}`,
    `${label('Navigator Grade:')} ${colorGrade(stats.navigatorGrade)}`,
    `${label('Best Path:')} ${stats.bestPath}`,
    `${label('Most Solvable:')} ${stats.mostSolvable}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Most Resistant:')} ${stats.mostResistant}`,
    `${label('Strongest Thread:')} ${stats.strongestThread}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ─────────────────────────────────────

/**
 * Format recommendations as list
 * @example
 * formatRecommendations(recs) // bullet list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return dim('No recommendations')
  const header = heading('Recommendations')
  const items = recommendations.map(r => `${dim('\u2022')} ${r}`)
  return `${header}\n${items.join('\n')}`
}

// ─── Full Result Formatting ────────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: LabyrinthThreadResult): string {
  const sections = [
    formatPathsTable(result.paths),
    '',
    formatLevelsTable(result.levels),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Maze')} ${label('Navigable:')} ${result.maze.isNavigable ? high('Yes') : low('No')} ${label('Overall Navigability:')} ${colorScore(result.maze.overallNavigability)}`,
    '',
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format complete result as JSON
 * @example
 * formatResultJson(result) // JSON string
 */
export function formatResultJson(result: LabyrinthThreadResult): string {
  return JSON.stringify(result, null, 2)
}
