import chalk from 'chalk'

import type { ShieldWallResult } from './shield-wall-helpers.js'

// ─── Color Helpers ─────────────────────────────────────────────────────────

/** @example scoreColor(90) returns green string */
export function scoreColor(score: number): string {
  if (score >= 80) return chalk.rgb(46, 204, 113)(String(score))
  if (score >= 60) return chalk.rgb(241, 196, 15)(String(score))
  if (score >= 40) return chalk.rgb(230, 126, 34)(String(score))
  return chalk.rgb(231, 76, 60)(String(score))
}

/** @example conditionColor('spartan-hoplon') returns colored string */
export function conditionColor(condition: string): string {
  switch (condition) {
    case 'spartan-hoplon': return chalk.rgb(255, 215, 0).bold(condition)
    case 'roman-scutum': return chalk.rgb(178, 34, 34)(condition)
    case 'viking-round': return chalk.rgb(46, 204, 113)(condition)
    case 'kite-shield': return chalk.rgb(52, 152, 219)(condition)
    case 'buckler': return chalk.rgb(230, 126, 34)(condition)
    case 'broken-board': return chalk.rgb(231, 76, 60)(condition)
    default: return condition
  }
}

/** @example gradeColor('strategos') returns bold string */
export function gradeColor(grade: string): string {
  switch (grade) {
    case 'strategos': return chalk.rgb(255, 215, 0).bold(grade)
    case 'centurion': return chalk.rgb(178, 34, 34)(grade)
    case 'shield-maiden': return chalk.rgb(46, 204, 113)(grade)
    case 'knight': return chalk.rgb(52, 152, 219)(grade)
    case 'militia-captain': return chalk.rgb(241, 196, 15)(grade)
    case 'coward': return chalk.rgb(231, 76, 60)(grade)
    default: return grade
  }
}

/** @example materialColor('iron') returns colored string */
export function materialColor(material: string): string {
  switch (material) {
    case 'iron': return chalk.rgb(192, 192, 192)(material)
    case 'bronze': return chalk.rgb(205, 127, 50)(material)
    case 'oak': return chalk.rgb(139, 69, 19)(material)
    case 'leather': return chalk.rgb(210, 180, 140)(material)
    case 'wicker': return chalk.rgb(241, 196, 15)(material)
    case 'paper': return chalk.rgb(231, 76, 60)(material)
    default: return material
  }
}

/** @example stateColor('battle-ready') returns colored string */
export function stateColor(state: string): string {
  switch (state) {
    case 'battle-ready': return chalk.rgb(46, 204, 113)(state)
    case 'well-prepared': return chalk.rgb(52, 152, 219)(state)
    case 'prepared': return chalk.rgb(241, 196, 15)(state)
    case 'under-prepared': return chalk.rgb(230, 126, 34)(state)
    case 'unprepared': return chalk.rgb(231, 76, 60)(state)
    case 'defenseless': return chalk.rgb(192, 57, 43).bold(state)
    default: return state
  }
}

// ─── JSON Formatter ────────────────────────────────────────────────────────

/** @example formatShieldWallJson(result) returns JSON string */
export function formatShieldWallJson(result: ShieldWallResult): string {
  return JSON.stringify(result, null, 2)
}

// ─── Table Formatter ───────────────────────────────────────────────────────

/** @example formatShieldWallTable(result, verbose) returns formatted string */
export function formatShieldWallTable(result: ShieldWallResult, verbose: boolean): string {
  const lines: string[] = []

  lines.push('')
  lines.push(chalk.rgb(178, 34, 34).bold('  Shield Wall Analysis'))
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Army Overview:'))
  lines.push(`    Overall Defense:        ${scoreColor(result.army.overallDefense)}`)
  lines.push(`    Avg Strength:           ${scoreColor(result.army.avgStrength)}`)
  lines.push(`    Avg Coverage:           ${scoreColor(result.army.avgCoverage)}`)
  lines.push(`    Avg Readiness:          ${scoreColor(result.army.avgReadiness)}`)
  lines.push(`    Is Impenetrable:        ${result.army.isImpenetrable ? chalk.rgb(46, 204, 113)('Yes') : chalk.rgb(231, 76, 60)('No')}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Statistics:'))
  lines.push(`    Total Files:                   ${result.stats.totalFiles}`)
  lines.push(`    Total Segments:                ${result.stats.totalSegments}`)
  lines.push(`    Avg Shield Strength:           ${scoreColor(result.stats.avgShieldStrength)}`)
  lines.push(`    Avg Overlap Coverage:          ${scoreColor(result.stats.avgOverlapCoverage)}`)
  lines.push(`    Avg Formation Integrity:       ${scoreColor(result.stats.avgFormationIntegrity)}`)
  lines.push(`    Avg Spear Coordination:        ${scoreColor(result.stats.avgSpearCoordination)}`)
  lines.push(`    Avg Battle Readiness:          ${scoreColor(result.stats.avgBattleReadiness)}`)
  lines.push(`    Avg Wall Resilience:           ${scoreColor(result.stats.avgWallResilience)}`)
  lines.push(`    Commander Grade:               ${gradeColor(result.stats.commanderGrade)}`)
  lines.push('')

  lines.push(chalk.rgb(210, 180, 140)('  Condition Counts:'))
  lines.push(`    Spartan Hoplon:                ${result.stats.spartanHoplonCount}`)
  lines.push(`    Roman Scutum:                  ${result.stats.romanScutumCount}`)
  lines.push(`    Viking Round:                  ${result.stats.vikingRoundCount}`)
  lines.push(`    Kite Shield:                   ${result.stats.kiteShieldCount}`)
  lines.push(`    Buckler:                       ${result.stats.bucklerCount}`)
  lines.push(`    Broken Board:                  ${result.stats.brokenBoardCount}`)
  lines.push('')

  if (result.stats.bestBearer) {
    lines.push(chalk.rgb(210, 180, 140)('  Highlights:'))
    lines.push(`    Best Bearer:        ${result.stats.bestBearer}`)
    lines.push(`    Strongest:          ${result.stats.strongest}`)
    lines.push(`    Best Covered:       ${result.stats.bestCovered}`)
    lines.push(`    Best Formation:     ${result.stats.bestFormation}`)
    lines.push(`    Most Coordinated:   ${result.stats.mostCoordinated}`)
    lines.push(`    Most Ready:         ${result.stats.mostReady}`)
    lines.push('')
  }

  if (verbose && result.bearers.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Per-File Details:'))
    for (const bearer of result.bearers) {
      lines.push(`    ${chalk.rgb(52, 152, 219)(bearer.file)}`)
      lines.push(`      Score: ${scoreColor(bearer.qualityScore)}  Condition: ${conditionColor(bearer.condition)}`)
      lines.push(`      Shield: ${materialColor(bearer.shield.material)}(${bearer.shieldStrength})  Overlap: ${bearer.overlap.quality}(${bearer.overlapCoverage})  Formation: ${bearer.formation.type}(${bearer.formationIntegrity})`)
      lines.push(`      Coord: ${bearer.coordination.style}(${bearer.spearCoordination})  Ready: ${stateColor(bearer.readiness.state)}(${bearer.battleReadiness})  Resilience: ${bearer.resilience.grade}(${bearer.wallResilience})`)
    }
    lines.push('')
  }

  if (result.recommendations.length > 0) {
    lines.push(chalk.rgb(210, 180, 140)('  Recommendations:'))
    for (const rec of result.recommendations) {
      lines.push(`    ${chalk.rgb(178, 34, 34)('\u{1F6E1}')} ${rec}`)
    }
    lines.push('')
  }

  return lines.join('\n')
}
