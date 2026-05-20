import chalk from 'chalk'
import type {
  LabyrinthPath,
  MinotaurPoint,
  DeadEnd,
  LabyrinthFile,
  LabyrinthStats,
  LabyrinthResult,
} from './labyrinth-helpers.js'

// ─── Path Formatting ───────────────────────────────────────────────────────────

/**
 * Format path type with color
 * @example
 * formatPathType('corridor') // green 'CORRIDOR'
 */
export function formatPathType(type: LabyrinthPath['type']): string {
  const colors: Record<LabyrinthPath['type'], (s: string) => string> = {
    corridor: chalk.green, branch: chalk.yellow, loop: chalk.cyan,
    'dead-end': chalk.red, shortcut: chalk.magenta, trap: chalk.rgb(255, 165, 0), spiral: chalk.rgb(200, 100, 200),
  }
  return colors[type](type.toUpperCase())
}

/**
 * Format a single labyrinth path
 * @example
 * formatPath(path) // '◆ BRANCH  L5  nav:75  complexity:20'
 */
export function formatPath(p: LabyrinthPath): string {
  const type = formatPathType(p.type)
  const wellLit = p.isWellLit ? chalk.green('◈') : chalk.gray('◇')
  return `${chalk.magenta('◆')} ${type.padEnd(14)} L${String(p.startLine).padStart(3)}-L${String(p.endLine).padStart(3)}  nav:${String(p.navigability).padStart(3)}  cplx:${String(p.complexity).padStart(3)}  ${wellLit}`
}

/**
 * Format all paths
 * @example
 * formatPaths(paths) // multi-line
 */
export function formatPaths(paths: LabyrinthPath[]): string {
  if (paths.length === 0) return chalk.gray('No paths mapped.')
  return paths.slice(0, 50).map(formatPath).join('\n')
}

// ─── Minotaur Formatting ───────────────────────────────────────────────────────

/**
 * Format danger level with color
 * @example
 * formatDangerLevel('deadly') // red 'DEADLY'
 */
export function formatDangerLevel(level: MinotaurPoint['dangerLevel']): string {
  const colors: Record<MinotaurPoint['dangerLevel'], (s: string) => string> = {
    tame: chalk.green, caution: chalk.yellow, dangerous: chalk.rgb(255, 165, 0), deadly: chalk.red,
  }
  return colors[level](level.toUpperCase())
}

/**
 * Format a single minotaur point
 * @example
 * formatMinotaur(minotaur) // '⚠ DECISION-FORK  L12  DEADLY'
 */
export function formatMinotaur(m: MinotaurPoint): string {
  const danger = formatDangerLevel(m.dangerLevel)
  const thread = m.threadRequired ? chalk.red('🧵') : ''
  return `${chalk.yellow('⚠')} ${m.type.padEnd(22)} L${String(m.line).padStart(3)}  ${danger.padEnd(12)} in:${m.incomingPaths} out:${m.outgoingPaths} ${thread}`
}

/**
 * Format all minotaur points
 * @example
 * formatMinotaurs(minotaurs) // multi-line
 */
export function formatMinotaurs(minotaurs: MinotaurPoint[]): string {
  if (minotaurs.length === 0) return chalk.green('✓ No minotaur points detected — labyrinth is navigable!')
  return minotaurs.map(formatMinotaur).join('\n')
}

// ─── Dead End Formatting ───────────────────────────────────────────────────────

/**
 * Format dead end severity
 * @example
 * formatDeadEndSeverity('major') // red 'MAJOR'
 */
export function formatDeadEndSeverity(severity: DeadEnd['severity']): string {
  const colors: Record<DeadEnd['severity'], (s: string) => string> = {
    minor: chalk.blue, moderate: chalk.yellow, major: chalk.red,
  }
  return colors[severity](severity.toUpperCase())
}

/**
 * Format a single dead end
 * @example
 * formatDeadEnd(deadEnd) // '✗ UNREACHABLE  L8  MAJOR'
 */
export function formatDeadEnd(d: DeadEnd): string {
  const severity = formatDeadEndSeverity(d.severity)
  return `${chalk.red('✗')} ${d.type.padEnd(22)} L${String(d.line).padStart(3)}  ${severity.padEnd(10)} ${d.description}`
}

/**
 * Format all dead ends
 * @example
 * formatDeadEnds(deadEnds) // multi-line
 */
export function formatDeadEnds(deadEnds: DeadEnd[]): string {
  if (deadEnds.length === 0) return chalk.green('✓ No dead ends detected — all paths are reachable!')
  return deadEnds.map(formatDeadEnd).join('\n')
}

// ─── File Classification Formatting ────────────────────────────────────────────

/**
 * Format file classification with color
 * @example
 * formatFileClassification('well-lit-corridor') // green
 */
export function formatFileClassification(cls: LabyrinthFile['classification']): string {
  const colors: Record<LabyrinthFile['classification'], (s: string) => string> = {
    'well-lit-corridor': chalk.green, 'structured-maze': chalk.cyan,
    'twisting-passage': chalk.yellow, 'dark-labyrinth': chalk.rgb(255, 165, 0), 'inescapable-maze': chalk.red,
  }
  return colors[cls](cls.toUpperCase().replace(/-/g, ' '))
}

/**
 * Format a single labyrinth file
 * @example
 * formatLabyrinthFile(file) // '◆ src/a.ts  WELL-LIT-CORRIDOR  nav:80'
 */
export function formatLabyrinthFile(f: LabyrinthFile): string {
  const cls = formatFileClassification(f.classification)
  return `${chalk.magenta('◆')} ${chalk.cyan(f.file.padEnd(30))} ${cls.padEnd(24)} nav:${String(f.navigability).padStart(3)} thread:${String(f.threadScore).padStart(3)} cplx:${String(f.complexity).padStart(3)}`
}

/**
 * Format all labyrinth files
 * @example
 * formatLabyrinthFiles(files) // multi-line
 */
export function formatLabyrinthFiles(files: LabyrinthFile[]): string {
  if (files.length === 0) return chalk.gray('No files analyzed.')
  return files.map(formatLabyrinthFile).join('\n')
}

// ─── Overall Classification Formatting ─────────────────────────────────────────

/**
 * Format overall classification with color
 * @example
 * formatOverallClassification('crystal-palace') // green
 */
export function formatOverallClassification(cls: LabyrinthStats['classification']): string {
  const colors: Record<LabyrinthStats['classification'], (s: string) => string> = {
    'crystal-palace': chalk.green, 'garden-maze': chalk.cyan,
    'medieval-castle': chalk.yellow, 'minotaur-labyrinth': chalk.rgb(255, 165, 0), 'eldritch-horror': chalk.red,
  }
  return colors[cls](cls.toUpperCase().replace(/-/g, ' '))
}

// ─── Stats Formatting ──────────────────────────────────────────────────────────

/**
 * Format stats summary
 * @example
 * formatStats(stats) // multi-line summary
 */
export function formatStats(stats: LabyrinthStats): string {
  const lines = [
    chalk.bold('═'.repeat(50)),
    chalk.bold('       LABYRINTH ANALYSIS SUMMARY'),
    chalk.bold('═'.repeat(50)),
    '',
    `${chalk.bold('Total Paths:')}              ${stats.totalPaths} (${stats.corridors} corridors, ${stats.branches} branches)`,
    `${chalk.bold('Shortcuts:')}                ${stats.shortcuts}`,
    `${chalk.bold('Traps:')}                    ${stats.traps}`,
    `${chalk.bold('Spirals:')}                  ${stats.spirals}`,
    '',
    `${chalk.bold('Minotaur Points:')}          ${stats.totalMinotaurs} (${stats.deadlyMinotaurs} deadly)`,
    `${chalk.bold('Dead Ends:')}                ${stats.totalDeadEnds}`,
    '',
    `${chalk.bold('Avg Navigability:')}         ${stats.avgNavigability}/100`,
    `${chalk.bold('Avg Thread Score:')}         ${stats.avgThreadScore}/100`,
    `${chalk.bold('Avg Complexity:')}           ${stats.avgComplexity}/100`,
    `${chalk.bold('Avg Lighting:')}             ${stats.avgLighting}/100`,
    '',
    `${chalk.bold('Well-Lit Files:')}           ${stats.wellLitFiles}`,
    `${chalk.bold('Dark Labyrinth Files:')}     ${stats.darkLabyrinthFiles}`,
    `${chalk.bold('Inescapable Maze Files:')}   ${stats.inescapableMazeFiles}`,
    '',
    `${chalk.bold('Labyrinth Score:')}          ${stats.labyrinthScore}/100 (lower is better)`,
    `${chalk.bold('Thread Reliability:')}       ${stats.threadReliability}/100`,
    `${chalk.bold('Classification:')}           ${formatOverallClassification(stats.classification)}`,
    '',
    chalk.bold('═'.repeat(50)),
  ]
  return lines.join('\n')
}

// ─── Recommendations ───────────────────────────────────────────────────────────

/**
 * Format recommendations list
 * @example
 * formatRecommendations(recs) // numbered list
 */
export function formatRecommendations(recommendations: string[]): string {
  if (recommendations.length === 0) return chalk.green('✓ No recommendations — the labyrinth is navigable!')
  return recommendations.map((r, i) => `${chalk.yellow(`${i + 1}.`)} ${r}`).join('\n')
}

// ─── Full Output ───────────────────────────────────────────────────────────────

/**
 * Format the complete labyrinth result
 * @example
 * formatLabyrinthResult(result) // full formatted string
 */
export function formatLabyrinthResult(result: LabyrinthResult): string {
  const sections = [
    formatStats(result.stats),
    '',
    chalk.bold('── Files ──'),
    formatLabyrinthFiles(result.files),
    '',
    chalk.bold('── Minotaur Points ──'),
    formatMinotaurs(result.files.flatMap(f => f.minotaurs)),
    '',
    chalk.bold('── Dead Ends ──'),
    formatDeadEnds(result.files.flatMap(f => f.deadEnds)),
    '',
    chalk.bold('── Recommendations ──'),
    formatRecommendations(result.recommendations),
  ]
  return sections.join('\n')
}

/**
 * Format labyrinth result as JSON string
 * @example
 * formatLabyrinthJson(result) // '{"files":[...],...}'
 */
export function formatLabyrinthJson(result: LabyrinthResult): string {
  return JSON.stringify(result, null, 2)
}
