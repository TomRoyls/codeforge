import chalk from 'chalk'

import type { LabyrinthDepthsResult } from './labyrinth-depths-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('grand-hall') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'grand-hall': return chalk.rgb(255, 215, 0).bold(condition)
    case 'well-lit-corridor': return chalk.rgb(46, 204, 113)(condition)
    case 'dim-passage': return chalk.rgb(52, 152, 219)(condition)
    case 'dark-tunnel': return chalk.rgb(241, 196, 15)(condition)
    case 'minotaur-lair': return chalk.rgb(230, 126, 34)(condition)
    case 'bottomless-pit': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('architect-king') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'architect-king': return chalk.rgb(255, 215, 0).bold(grade)
    case 'master-builder': return chalk.rgb(46, 204, 113)(grade)
    case 'navigator': return chalk.rgb(155, 89, 182)(grade)
    case 'explorer': return chalk.rgb(52, 152, 219)(grade)
    case 'wanderer': return chalk.rgb(241, 196, 15)(grade)
    case 'sacrifice': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example patternColor('elegant-passage') returns colored string */
export function patternColor(pattern: string): string {
  switch (pattern) {
    case 'elegant-passage': return chalk.rgb(255, 215, 0).bold(pattern)
    case 'structured-maze': return chalk.rgb(46, 204, 113)(pattern)
    case 'branching-tunnel': return chalk.rgb(155, 89, 182)(pattern)
    case 'chaotic-corridor': return chalk.rgb(52, 152, 219)(pattern)
    case 'dead-end-network': return chalk.rgb(241, 196, 15)(pattern)
    case 'impenetrable': return chalk.rgb(231, 76, 60)(pattern)
    default: return pattern
  }
}

/** @example stateColor('golden-thread') returns colored string */
export function stateColor(state: string): string {
  switch (state) {
    case 'golden-thread': return chalk.rgb(255, 215, 0).bold(state)
    case 'guided-path': return chalk.rgb(46, 204, 113)(state)
    case 'marked-trail': return chalk.rgb(155, 89, 182)(state)
    case 'faint-trail': return chalk.rgb(52, 152, 219)(state)
    case 'overgrown': return chalk.rgb(241, 196, 15)(state)
    case 'invisible': return chalk.rgb(231, 76, 60)(state)
    default: return state
  }
}

/** @example threatColor('no-monster') returns colored string */
export function threatColor(threat: string): string {
  switch (threat) {
    case 'no-monster': return chalk.rgb(255, 215, 0).bold(threat)
    case 'minor-threat': return chalk.rgb(46, 204, 113)(threat)
    case 'beast-lurks': return chalk.rgb(155, 89, 182)(threat)
    case 'active-minotaur': return chalk.rgb(52, 152, 219)(threat)
    case 'multi-minotaur': return chalk.rgb(241, 196, 15)(threat)
    case 'labyrinth-king': return chalk.rgb(231, 76, 60)(threat)
    default: return threat
  }
}

/** @example clarityColor('crystal-exit') returns colored string */
export function clarityColor(clarity: string): string {
  switch (clarity) {
    case 'crystal-exit': return chalk.rgb(255, 215, 0).bold(clarity)
    case 'marked-door': return chalk.rgb(46, 204, 113)(clarity)
    case 'dim-passage': return chalk.rgb(155, 89, 182)(clarity)
    case 'hidden-exit': return chalk.rgb(52, 152, 219)(clarity)
    case 'false-wall': return chalk.rgb(241, 196, 15)(clarity)
    case 'sealed-tomb': return chalk.rgb(231, 76, 60)(clarity)
    default: return clarity
  }
}

/** @example stratumColor('surface-level') returns colored string */
export function stratumColor(stratum: string): string {
  switch (stratum) {
    case 'surface-level': return chalk.rgb(255, 215, 0).bold(stratum)
    case 'shallow-caves': return chalk.rgb(46, 204, 113)(stratum)
    case 'mid-labyrinth': return chalk.rgb(155, 89, 182)(stratum)
    case 'deep-passages': return chalk.rgb(52, 152, 219)(stratum)
    case 'abyss': return chalk.rgb(241, 196, 15)(stratum)
    case 'tartarus': return chalk.rgb(231, 76, 60)(stratum)
    default: return stratum
  }
}

/** @example rankColor('master-navigator') returns colored string */
export function rankColor(rank: string): string {
  switch (rank) {
    case 'master-navigator': return chalk.rgb(255, 215, 0).bold(rank)
    case 'experienced-explorer': return chalk.rgb(46, 204, 113)(rank)
    case 'competent': return chalk.rgb(155, 89, 182)(rank)
    case 'wanderer': return chalk.rgb(52, 152, 219)(rank)
    case 'lost': return chalk.rgb(241, 196, 15)(rank)
    case 'doomed': return chalk.rgb(231, 76, 60)(rank)
    default: return rank
  }
}

/** @example levelTypeColor('palace-level') returns colored string */
export function levelTypeColor(type: string): string {
  switch (type) {
    case 'palace-level': return chalk.rgb(255, 215, 0).bold(type)
    case 'structured-level': return chalk.rgb(46, 204, 113)(type)
    case 'branching-level': return chalk.rgb(155, 89, 182)(type)
    case 'maze-level': return chalk.rgb(52, 152, 219)(type)
    case 'chaotic-level': return chalk.rgb(241, 196, 15)(type)
    case 'void': return chalk.rgb(231, 76, 60)(type)
    default: return type
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatLabyrinthDepthsJson(result) returns JSON string */
export function formatLabyrinthDepthsJson(result: LabyrinthDepthsResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatLabyrinthDepthsTable(result, verbose) returns formatted string */
export function formatLabyrinthDepthsTable(result: LabyrinthDepthsResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(155, 89, 182).bold('  Labyrinth Depths Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Labyrinth Overview:'))
  lines.push(`    Overall Navigability:  ${scoreColor(result.labyrinth.overallNavigability)}`)
  lines.push(`    Avg Complexity:        ${scoreColor(result.labyrinth.avgComplexity)}`)
  lines.push(`    Avg Thread Quality:    ${scoreColor(result.labyrinth.avgThread)}`)
  lines.push(`    Avg Theseus Score:     ${scoreColor(result.labyrinth.avgTheseus)}`)
  lines.push(`    Is Navigable:          ${result.labyrinth.isNavigable ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:            ${result.stats.totalFiles}`)
  lines.push(`    Total Levels:           ${result.stats.totalLevels}`)
  lines.push(`    Avg Maze Complexity:    ${scoreColor(result.stats.avgMazeComplexity)}`)
  lines.push(`    Avg Thread Quality:     ${scoreColor(result.stats.avgThreadQuality)}`)
  lines.push(`    Avg Minotaur Danger:    ${scoreColor(result.stats.avgMinotaurDanger)}`)
  lines.push(`    Avg Exit Availability:  ${scoreColor(result.stats.avgExitAvailability)}`)
  lines.push(`    Avg Arch. Depth:        ${scoreColor(result.stats.avgArchitecturalDepth)}`)
  lines.push(`    Avg Theseus Score:      ${scoreColor(result.stats.avgTheseusScore)}`)
  lines.push(`    Navigator Grade:        ${gradeColor(result.stats.navigatorGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Grand Hall:       ${result.stats.grandHallCount}`)
  lines.push(`    Well-Lit Corridor:${result.stats.wellLitCount}`)
  lines.push(`    Dim Passage:      ${result.stats.dimPassageCount}`)
  lines.push(`    Dark Tunnel:      ${result.stats.darkTunnelCount}`)
  lines.push(`    Minotaur Lair:    ${result.stats.minotaurLairCount}`)
  lines.push(`    Bottomless Pit:   ${result.stats.bottomlessPitCount}`)
  lines.push('')

  if (result.stats.bestChamber) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Chamber:     ${result.stats.bestChamber}`)
    lines.push(`    Simplest:         ${result.stats.simplest}`)
    lines.push(`    Clearest:         ${result.stats.clearest}`)
    lines.push(`    Safest:           ${result.stats.safest}`)
    lines.push(`    Best Exits:       ${result.stats.bestExits}`)
    lines.push(`    Most Navigable:   ${result.stats.mostNavigable}`)
    lines.push('')
  }

  if (verbose && result.chambers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const chamber of result.chambers) {
      lines.push(`    ${chalk.rgb(155, 89, 182)(chamber.file)}`)
      lines.push(`      Score: ${scoreColor(chamber.qualityScore)}  Condition: ${conditionColor(chamber.condition)}`)
      lines.push(`      Maze: ${patternColor(chamber.maze.pattern)}(${chamber.mazeComplexity})  Thread: ${stateColor(chamber.thread.state)}(${chamber.threadQuality})  Minotaur: ${threatColor(chamber.minotaur.threat)}(${chamber.minotaurDanger})`)
      lines.push(`      Exit: ${clarityColor(chamber.exit.clarity)}(${chamber.exitAvailability})  Depth: ${stratumColor(chamber.depth.stratum)}(${chamber.architecturalDepth})  Theseus: ${rankColor(chamber.theseus.rank)}(${chamber.theseusScore})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(155, 89, 182)('\u{1F3F0}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
