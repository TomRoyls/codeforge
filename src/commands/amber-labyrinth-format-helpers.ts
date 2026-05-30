// ─── Imports ───────────────────────────────────────────────────────
import chalk from 'chalk'
import type { AmberPath, LabyrinthWing, AmberLabyrinthResult } from './amber-labyrinth-helpers.js'

// ─── Color Palette (amber labyrinth — warm gold/amber/honey) ──────
const high = chalk.rgb(230, 190, 100)
const midHigh = chalk.rgb(215, 175, 85)
const mid = chalk.rgb(200, 160, 70)
const lowMid = chalk.rgb(185, 145, 55)
const low = chalk.rgb(170, 130, 40)

const best = chalk.rgb(245, 210, 120).bold
const good = chalk.rgb(230, 195, 105)
const okay = chalk.rgb(210, 175, 90)
const poor = chalk.rgb(190, 155, 75)
const worst = chalk.rgb(170, 135, 60)

const heading = chalk.rgb(225, 195, 110).bold
const label = chalk.rgb(205, 175, 95)
const dim = chalk.rgb(185, 155, 80)

// ─── Score Coloring ────────────────────────────────────────────────

/**
 * Color a numeric score by tier
 * @example
 * colorScore(90) // golden amber
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
 * colorGrade('golden-corridor') // best (bold amber)
 */
export function colorGrade(grade: string): string {
  const g = grade.toLowerCase()
  const tierMap: Record<string, (s: string) => string> = {
    'golden-corridor': best, 'perfect-amber': best, 'logical-labyrinth': best,
    'beast-tamer': best, 'golden-thread': best, 'golden-maze': best,
    'grand-labyrinth': best, 'magnificent-maze': best, 'daedalus': best,

    'clear-path': good, 'golden-resin': good, 'proper-maze': good,
    'skilled-handler': good, 'clear-trace': good, 'amber-sanctuary': good,
    'golden-labyrinth': good, 'master-architect': good,

    'proper-hallway': okay, 'proper-preservation': okay, 'decent-winding': okay,
    'proper-management': okay, 'proper-path': okay, 'proper-labyrinth': okay,
    'decent-wing': okay, 'decent-maze': okay, 'skilled-builder': okay,

    'winding-tunnel': poor, 'fading-memory': poor, 'random-twists': poor,
    'overwhelmed': poor, 'tangled-yarn': poor, 'crumbling-maze': poor,
    'narrow-corridor': poor, 'crumbling-walls': poor, 'apprentice': poor,

    'dark-passage': worst, 'cracked-amber': worst, 'chaotic-turns': worst,
    'fleeing-hero': worst, 'broken-thread': worst, 'dark-tunnel': worst,
    'dead-end-hall': worst, 'ruined-passages': worst, 'novice': worst,

    'dead-end': worst, 'no-amber': worst, 'no-coherence': worst,
    'no-handling': worst, 'no-thread': worst, 'collapsed': worst,
    'no-wing': worst, 'void': worst, 'lost-soul': worst,
  }
  return (tierMap[g] ?? low)(grade)
}

// ─── Path Formatting ──────────────────────────────────────────────

/**
 * Format a single amber path for display
 * @example
 * formatPathTable(path) // colored path info
 */
export function formatPathTable(path: AmberPath): string {
  const parts = [
    `${label('File:')} ${dim(path.file)}`,
    `${label('Path Clarity:')} ${colorScore(path.pathClarity)} ${colorGrade(path.navigating.grade)}`,
    `${label('Amber Preservation:')} ${colorScore(path.amberPreservation)} ${colorGrade(path.preserving.amber)}`,
    `${label('Twist Coherence:')} ${colorScore(path.twistCoherence)} ${colorGrade(path.twisting.twist)}`,
    `${label('Minotaur Handling:')} ${colorScore(path.minotaurHandling)} ${colorGrade(path.taming.minotaur)}`,
    `${label('Thread Followability:')} ${colorScore(path.threadFollowability)} ${colorGrade(path.tracing.thread)}`,
    `${label('Score:')} ${colorScore(path.qualityScore)} ${colorGrade(path.condition)}`,
  ]
  return parts.join('\n')
}

/**
 * Format paths as summary table
 * @example
 * formatPathsTable(paths) // multi-line table
 */
export function formatPathsTable(paths: AmberPath[]): string {
  if (paths.length === 0) return dim('No amber paths found')
  const header = heading('Amber Labyrinth Analysis')
  const rows = paths.map(p => formatPathTable(p))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Wing Formatting ──────────────────────────────────────────────

/**
 * Format a wing for display
 * @example
 * formatWingTable(wing) // colored wing info
 */
export function formatWingTable(wing: LabyrinthWing): string {
  const parts = [
    `${label('Wing:')} ${dim(wing.directory)}`,
    `${label('Type:')} ${colorGrade(wing.wingType)}`,
    `${label('Condition:')} ${colorGrade(wing.condition)}`,
    `${label('Paths:')} ${String(wing.paths.length)}`,
    `${label('Avg Clarity:')} ${colorScore(wing.avgClarity)}`,
    `${label('Avg Coherence:')} ${colorScore(wing.avgCoherence)}`,
    `${label('Avg Followability:')} ${colorScore(wing.avgFollowability)}`,
    `${label('Golden Maze:')} ${String(wing.goldenMazeCount)}`,
    `${label('Collapsed:')} ${String(wing.collapsedCount)}`,
  ]
  return parts.join('\n')
}

/**
 * Format all wings as summary
 * @example
 * formatWingsTable(wings) // multi-line summary
 */
export function formatWingsTable(wings: LabyrinthWing[]): string {
  if (wings.length === 0) return dim('No labyrinth wings found')
  const header = heading('Labyrinth Wings')
  const rows = wings.map(w => formatWingTable(w))
  return `${header}\n${rows.join('\n\n')}`
}

// ─── Stats Formatting ─────────────────────────────────────────────

/**
 * Format statistics summary
 * @example
 * formatStatsTable(stats) // colored stats
 */
export function formatStatsTable(stats: AmberLabyrinthResult['stats']): string {
  const parts = [
    heading('Amber Labyrinth Statistics'),
    `${label('Total Files:')} ${String(stats.totalFiles)}`,
    `${label('Total Wings:')} ${String(stats.totalWings)}`,
    `${label('Avg Path Clarity:')} ${colorScore(stats.avgPathClarity)}`,
    `${label('Avg Amber Preservation:')} ${colorScore(stats.avgAmberPreservation)}`,
    `${label('Avg Twist Coherence:')} ${colorScore(stats.avgTwistCoherence)}`,
    `${label('Avg Minotaur Handling:')} ${colorScore(stats.avgMinotaurHandling)}`,
    `${label('Avg Thread Followability:')} ${colorScore(stats.avgThreadFollowability)}`,
    `${label('Golden Maze:')} ${String(stats.goldenMazeCount)}`,
    `${label('Amber Sanctuary:')} ${String(stats.amberSanctuaryCount)}`,
    `${label('Proper Labyrinth:')} ${String(stats.properLabyrinthCount)}`,
    `${label('Crumbling Maze:')} ${String(stats.crumblingMazeCount)}`,
    `${label('Dark Tunnel:')} ${String(stats.darkTunnelCount)}`,
    `${label('Collapsed:')} ${String(stats.collapsedCount)}`,
    `${label('High Clarity:')} ${String(stats.hasHighClarityCount)}`,
    `${label('High Preservation:')} ${String(stats.hasHighPreservationCount)}`,
    `${label('High Coherence:')} ${String(stats.hasHighCoherenceCount)}`,
    `${label('High Handling:')} ${String(stats.hasHighHandlingCount)}`,
    `${label('High Followability:')} ${String(stats.hasHighFollowabilityCount)}`,
    `${label('Overall Design:')} ${colorScore(stats.overallDesign)}`,
    `${label('Architect Grade:')} ${colorGrade(stats.architectGrade)}`,
    `${label('Best Path:')} ${stats.bestPath}`,
    `${label('Clearest:')} ${stats.clearest}`,
    `${label('Best Preserved:')} ${stats.bestPreserved}`,
    `${label('Most Coherent:')} ${stats.mostCoherent}`,
    `${label('Best Thread:')} ${stats.bestThread}`,
  ]
  return parts.join('\n')
}

// ─── Recommendation Formatting ────────────────────────────────────

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

// ─── Full Result Formatting ───────────────────────────────────────

/**
 * Format complete result as table
 * @example
 * formatResultTable(result) // full colored output
 */
export function formatResultTable(result: AmberLabyrinthResult): string {
  const sections = [
    formatPathsTable(result.paths),
    '',
    formatWingsTable(result.wings),
    '',
    formatStatsTable(result.stats),
    '',
    `${heading('Maze')} ${label('Navigable:')} ${result.maze.isNavigable ? high('Yes') : low('No')} ${label('Overall Design:')} ${colorScore(result.maze.overallDesign)}`,
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
export function formatResultJson(result: AmberLabyrinthResult): string {
  return JSON.stringify(result, null, 2)
}
